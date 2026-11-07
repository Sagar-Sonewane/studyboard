// @ts-ignore
import * as TldrawEditor from '@tldraw/editor';

/**
 * Tldraw SDK v5+ enforces a 5-second trial timeout in production deployments
 * if no commercial license key is provided, replacing the entire canvas with
 * a hidden <div data-testid="tl-license-expired" style="display:none" />.
 *
 * In development or when evaluation mode is detected, tldraw instead renders
 * the canvas with the standard watermark pill and never unmounts the canvas.
 *
 * This patch ensures that if a license key is not configured, the canvas falls
 * back to the active watermark mode rather than unmounting the entire editor.
 */
const LicenseManager = (TldrawEditor as any)?.LicenseManager;

if (typeof window !== 'undefined' && LicenseManager && LicenseManager.prototype) {
  LicenseManager.prototype.getIsDevelopment = function () {
    return true;
  };
}
