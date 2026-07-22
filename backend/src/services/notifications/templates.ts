import type { EmailModuleSummary, ProjectProgressSnapshot } from '../progressService';
import type { FeatureStatus, ModuleStatus, ProjectStatus } from '@prisma/client';

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** Escapes user-supplied text before interpolating into HTML email bodies. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Email-safe palette (light; email clients don't reliably honor dark mode),
// tuned to read as the same clean, minimal Geist look as the app.
const C = {
  pageBg: '#f5f5f5',
  card: '#ffffff',
  border: '#ececec',
  hairline: '#f0f0f0',
  footerBg: '#fafafa',
  ink: '#0a0a0a',
  inkBody: '#525252',
  inkMuted: '#8f8f8f',
  track: '#ededed',
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type PillKind = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

const PILL_STYLES: Record<PillKind, { bg: string; fg: string; bd: string }> = {
  success: { bg: '#ecfdf3', fg: '#067647', bd: '#abefc6' },
  info: { bg: '#eff8ff', fg: '#175cd3', bd: '#b2ddff' },
  warning: { bg: '#fffaeb', fg: '#b54708', bd: '#fedf89' },
  danger: { bg: '#fef3f2', fg: '#b42318', bd: '#fecdca' },
  neutral: { bg: '#f5f5f5', fg: '#666666', bd: '#e5e5e5' },
};

function pill(label: string, kind: PillKind): string {
  const s = PILL_STYLES[kind];
  return `<span style="display:inline-block;padding:3px 10px;font-size:12px;font-weight:600;line-height:1.4;color:${s.fg};background:${s.bg};border:1px solid ${s.bd};border-radius:9999px;white-space:nowrap;">${escapeHtml(
    label,
  )}</span>`;
}

const MODULE_STATUS: Record<ModuleStatus, { label: string; kind: PillKind }> = {
  NOT_STARTED: { label: 'Not started', kind: 'neutral' },
  IN_PROGRESS: { label: 'In progress', kind: 'info' },
  BLOCKED: { label: 'Blocked', kind: 'danger' },
  COMPLETED: { label: 'Completed', kind: 'success' },
};

const PROJECT_STATUS: Record<ProjectStatus, { label: string; kind: PillKind }> = {
  PLANNING: { label: 'Planning', kind: 'neutral' },
  IN_PROGRESS: { label: 'In progress', kind: 'info' },
  ON_HOLD: { label: 'On hold', kind: 'warning' },
  COMPLETED: { label: 'Completed', kind: 'success' },
  CANCELLED: { label: 'Cancelled', kind: 'danger' },
};

const FEATURE_PILL_KIND: Record<FeatureStatus, PillKind> = {
  TODO: 'neutral',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
};

const FEATURE_STATUS: Record<FeatureStatus, { label: string; dot: string }> = {
  TODO: { label: 'To do', dot: '#c4c4c4' },
  IN_PROGRESS: { label: 'In progress', dot: '#d97706' },
  COMPLETED: { label: 'Completed', dot: '#16a34a' },
};

/** A single module card (header + feature list). Sits inside a grid cell. */
function moduleCard(module: EmailModuleSummary): string {
  const mod = MODULE_STATUS[module.status];
  const featureRows =
    module.features.length === 0
      ? `<tr>
          <td style="border-top:1px solid ${C.hairline};padding:9px 12px;font-size:13px;color:${C.inkMuted};">No features yet</td>
        </tr>`
      : module.features
          .map((feature) => {
            const feat = FEATURE_STATUS[feature.status];
            return `<tr>
              <td style="border-top:1px solid ${C.hairline};padding:9px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align:middle;">
                      <span style="display:inline-block;width:7px;height:7px;border-radius:9999px;background:${feat.dot};"></span>
                      <span style="font-size:13px;color:${C.ink};padding-left:8px;">${escapeHtml(feature.title)}</span>
                    </td>
                    <td align="right" style="vertical-align:middle;font-size:12px;color:${C.inkMuted};white-space:nowrap;padding-left:8px;">${feat.label}</td>
                  </tr>
                </table>
              </td>
            </tr>`;
          })
          .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:10px;overflow:hidden;">
    <tr>
      <td style="background:${C.footerBg};padding:11px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align:middle;font-size:14px;font-weight:600;color:${C.ink};">${escapeHtml(module.title)}</td>
            <td align="right" style="vertical-align:middle;white-space:nowrap;padding-left:8px;">
              <span style="font-size:12px;color:${C.inkMuted};padding-right:6px;">${module.progress}%</span>
              ${pill(mod.label, mod.kind)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${featureRows}
  </table>`;
}

/** Modules laid out as a 2-column grid (stacks to 1 column on mobile). */
function modulesBreakdown(modules: EmailModuleSummary[]): string {
  if (modules.length === 0) return '';

  const rows: string[] = [];
  for (let i = 0; i < modules.length; i += 2) {
    const left = modules[i];
    const right = modules[i + 1];
    rows.push(`<tr>
      <td class="mod-col" width="50%" valign="top" style="padding:0 6px 12px 0;">${left ? moduleCard(left) : ''}</td>
      <td class="mod-col" width="50%" valign="top" style="padding:0 0 12px 6px;">${right ? moduleCard(right) : ''}</td>
    </tr>`);
  }

  return `<div style="margin-top:22px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;color:${C.inkMuted};">Modules &amp; features</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>
  </div>`;
}

function quote(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
    <tr>
      <td style="padding:14px 16px;background:#fafafa;border:1px solid ${C.border};border-left:3px solid #d4d4d4;border-radius:8px;font-size:14px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${escapeHtml(
        text,
      )}</td>
    </tr>
  </table>`;
}

function lead(text: string): string {
  return `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:${C.inkBody};">${text}</p>`;
}

/**
 * A horizontal summary: three stat columns (progress / modules / features done)
 * across the top, and a full-width progress bar underneath. Uses the email's
 * horizontal space rather than stacking everything vertically.
 */
function summaryCard(progress: ProjectProgressSnapshot): string {
  const pct = Math.max(0, Math.min(100, Math.round(progress.overallProgress)));
  const moduleCount = progress.modules.length;
  const totalFeatures = progress.modules.reduce((sum, m) => sum + m.features.length, 0);
  const doneFeatures = progress.modules.reduce(
    (sum, m) => sum + m.features.filter((f) => f.status === 'COMPLETED').length,
    0,
  );
  const fillMinWidth = pct === 0 ? '0' : '8';

  const stat = (label: string, value: string, borderLeft: boolean): string =>
    `<td width="33%" style="${borderLeft ? `border-left:1px solid ${C.hairline};` : ''}padding:14px 16px;vertical-align:top;">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${C.inkMuted};">${label}</div>
      <div style="margin-top:5px;font-size:20px;font-weight:600;line-height:1;color:${C.ink};">${value}</div>
    </td>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin:4px 0;">
    <tr>
      ${stat('Progress', `${pct}%`, false)}
      ${stat('Modules', String(moduleCount), true)}
      ${stat('Features done', `${doneFeatures} / ${totalFeatures}`, true)}
    </tr>
    <tr>
      <td colspan="3" style="border-top:1px solid ${C.hairline};padding:14px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.track};border-radius:9999px;">
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <table role="presentation" width="${pct}%" cellpadding="0" cellspacing="0" style="min-width:${fillMinWidth}px;">
                <tr>
                  <td style="height:8px;background:${C.ink};border-radius:9999px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

interface LayoutParams {
  preheader: string;
  pillHtml: string;
  heading: string;
  bodyHtml: string;
}

function layout({ preheader, pillHtml, heading, bodyHtml }: LayoutParams): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <style>
      @media only screen and (max-width: 480px) {
        .mod-col {
          display: block !important;
          width: 100% !important;
          padding: 0 0 12px 0 !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${C.pageBg};font-family:${FONT};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.pageBg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:18px 28px;border-bottom:1px solid ${C.hairline};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background:${C.ink};color:#ffffff;font-size:12px;font-weight:700;border-radius:7px;letter-spacing:-0.02em;">CP</span>
                    </td>
                    <td style="vertical-align:middle;padding-left:10px;">
                      <span style="font-size:15px;font-weight:600;color:${C.ink};letter-spacing:-0.01em;">Client Portal</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${pillHtml}
                <h1 style="margin:14px 0 8px;font-size:20px;font-weight:600;line-height:1.3;color:${C.ink};letter-spacing:-0.02em;">${escapeHtml(
                  heading,
                )}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid ${C.hairline};background:${C.footerBg};">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${C.inkMuted};">
                  You're receiving this because you're a client on this project.<br />
                  Automated message from Client Portal — please don't reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Plain-text rendering of the module/feature breakdown for the text part. */
function modulesBreakdownText(snapshot: ProjectProgressSnapshot): string {
  if (snapshot.modules.length === 0) return '';
  const lines = snapshot.modules.map((module) => {
    const header = `- ${module.title} [${MODULE_STATUS[module.status].label}] ${module.progress}%`;
    const feats = module.features.length
      ? module.features
          .map((f) => `    • ${f.title} — ${FEATURE_STATUS[f.status].label}`)
          .join('\n')
      : '    (no features)';
    return `${header}\n${feats}`;
  });
  return `\n\nProgress: ${snapshot.overallProgress}%\n\nModules & features:\n${lines.join('\n')}`;
}

export function moduleUpdateTemplate(params: {
  projectTitle: string;
  moduleTitle: string;
  status: ModuleStatus;
  progress: ProjectProgressSnapshot;
}): EmailContent {
  const { projectTitle, moduleTitle, status, progress } = params;
  const complete = status === 'COMPLETED';
  const mod = MODULE_STATUS[status];
  return {
    subject: complete
      ? `Module completed: ${moduleTitle}`
      : `Update on "${moduleTitle}" — ${projectTitle}`,
    html: layout({
      preheader: complete
        ? `"${moduleTitle}" in ${projectTitle} is complete — ${progress.overallProgress}% overall.`
        : `Latest on "${moduleTitle}" in ${projectTitle} — ${progress.overallProgress}% overall.`,
      pillHtml: pill(mod.label, mod.kind),
      heading: complete ? 'Module completed' : 'Module update',
      bodyHtml:
        lead(
          complete
            ? `The <strong style="color:${C.ink};">${escapeHtml(moduleTitle)}</strong> module in <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong> is complete.`
            : `Here's the latest on the <strong style="color:${C.ink};">${escapeHtml(moduleTitle)}</strong> module in <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong>.`,
        ) +
        summaryCard(progress) +
        modulesBreakdown(progress.modules),
    }),
    text:
      (complete
        ? `Module completed\n\nThe module "${moduleTitle}" in project "${projectTitle}" is complete.`
        : `Module update\n\n"${moduleTitle}" in project "${projectTitle}" — status: ${mod.label}.`) +
      modulesBreakdownText(progress),
  };
}

export function featureUpdateTemplate(params: {
  projectTitle: string;
  moduleTitle: string;
  featureTitle: string;
  status: FeatureStatus;
  progress: ProjectProgressSnapshot;
}): EmailContent {
  const { projectTitle, moduleTitle, featureTitle, status, progress } = params;
  const complete = status === 'COMPLETED';
  const label = FEATURE_STATUS[status].label;
  return {
    subject: complete
      ? `Feature completed: ${featureTitle}`
      : `Update on "${featureTitle}" — ${projectTitle}`,
    html: layout({
      preheader: complete
        ? `"${featureTitle}" in ${projectTitle} is complete — ${progress.overallProgress}% overall.`
        : `Latest on "${featureTitle}" in ${projectTitle} — ${progress.overallProgress}% overall.`,
      pillHtml: pill(label, FEATURE_PILL_KIND[status]),
      heading: complete ? 'Feature completed' : 'Feature update',
      bodyHtml:
        lead(
          complete
            ? `A feature in <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong> is complete.`
            : `Here's the latest on a feature in <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong>.`,
        ) +
        summaryCard(progress) +
        modulesBreakdown(progress.modules),
    }),
    text:
      (complete
        ? `Feature completed\n\nThe feature "${featureTitle}" (module "${moduleTitle}") in project "${projectTitle}" is complete.`
        : `Feature update\n\n"${featureTitle}" (module "${moduleTitle}") in project "${projectTitle}" — status: ${label}.`) +
      modulesBreakdownText(progress),
  };
}

export function projectUpdateTemplate(params: {
  projectTitle: string;
  status: ProjectStatus;
  progress: ProjectProgressSnapshot;
}): EmailContent {
  const { projectTitle, status, progress } = params;
  const complete = status === 'COMPLETED';
  const proj = PROJECT_STATUS[status];
  return {
    subject: complete
      ? `Project completed: ${projectTitle}`
      : `Project update: ${projectTitle} (${progress.overallProgress}% complete)`,
    html: layout({
      preheader: complete
        ? `${projectTitle} is complete. Thank you for working with us!`
        : `${projectTitle} — ${progress.overallProgress}% complete.`,
      pillHtml: pill(proj.label, proj.kind),
      heading: complete ? 'Your project is complete' : 'Project progress update',
      bodyHtml:
        lead(
          complete
            ? `Great news — <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong> has been delivered and marked complete. Thank you for working with us.`
            : `Here's the latest progress on <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong>.`,
        ) +
        summaryCard(progress) +
        modulesBreakdown(progress.modules),
    }),
    text:
      (complete
        ? `Your project is complete\n\n"${projectTitle}" has been delivered and marked complete. Thank you for working with us!`
        : `Project update\n\nHere's the latest progress on "${projectTitle}" — ${progress.overallProgress}% overall (status: ${proj.label}).`) +
      modulesBreakdownText(progress),
  };
}

export function commentAddedTemplate(params: {
  projectTitle: string;
  authorName: string;
  message: string;
}): EmailContent {
  const { projectTitle, authorName, message } = params;
  return {
    subject: `New comment from ${authorName}`,
    html: layout({
      preheader: `${authorName} commented on ${projectTitle}: ${message.slice(0, 80)}`,
      pillHtml: pill('New comment', 'info'),
      heading: 'New comment on your project',
      bodyHtml:
        lead(
          `<strong style="color:${C.ink};">${escapeHtml(authorName)}</strong> posted a comment on <strong style="color:${C.ink};">${escapeHtml(projectTitle)}</strong>.`,
        ) + quote(message),
    }),
    text: `New comment on your project\n\n${authorName} posted a new comment on project "${projectTitle}":\n\n${message}`,
  };
}
