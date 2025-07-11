import { type Plugin } from 'vite';

export function CacheBusting(regexps: RegExp[]): Plugin {

    return {
        name: 'my-cache-busting-add-timestamp-to-scripts-and-stylesheets',
        transformIndexHtml(html) {
            const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14);
            regexps.forEach((regexp) => {
                html = html.replace(regexp, `$1?${timestamp}$2`);
            });
            return html;
        }
    }
}
