"""Render the responsive README images (desktop/mobile x dark/light) to PNG: header, projects, stack."""
import argparse, functools, http.server, os, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
LAYOUTS = {'desktop': ((1600, 720), 1.5), 'mobile': ((800, 1240), 1.35)}
PAGES = {'hero': 'profile.html', 'stack': 'stack.html',
         **{name: f'project.html?project={name}&' for name in ('codeforge', 'vericore', 'intervexa')}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=HERE.parents[1] / 'assets' / 'profile')
    parser.add_argument('--browser', default=os.environ.get('PORTFOLIO_BROWSER_PATH'))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(HERE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    options = {'headless': True, 'args': ['--enable-unsafe-swiftshader']}
    edge = Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    if args.browser:
        options['executable_path'] = args.browser
    elif edge.exists():
        options['executable_path'] = str(edge)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(**options)
            for name, source in PAGES.items():
                for layout, ((w, h), scale) in LAYOUTS.items():
                    for theme in ('dark', 'light'):
                        # Stack sheets size their own height; give them room to lay out.
                        page = browser.new_page(viewport={'width': w, 'height': 2000 if name == 'stack' else h},
                                                device_scale_factor=scale)
                        sep = '' if source.endswith('&') else '?'
                        page.goto(f'http://127.0.0.1:{server.server_address[1]}/{source}{sep}layout={layout}&theme={theme}')
                        page.wait_for_function('window.ready===true', timeout=60000)
                        out = args.output / f'{name}-{layout}-{theme}.png'
                        page.locator('#sheet').screenshot(path=str(out))
                        page.close()
                        print('Rendered', out.name)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
