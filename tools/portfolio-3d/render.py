"""Reproduce the static portfolio assets from original Three.js geometry."""
import argparse,functools,http.server,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[2]/'assets')
    parser.add_argument('--browser',default=os.environ.get('PORTFOLIO_BROWSER_PATH'))
    args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parent)))
    worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start()
    options={'headless':True,'args':['--enable-unsafe-swiftshader']}
    edge=Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    if args.browser:options['executable_path']=args.browser
    elif edge.exists():options['executable_path']=str(edge)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(**options)
            page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
            for name in ['hero','codeforge','vericore','intervexa']:
                page.goto(f'http://127.0.0.1:{server.server_address[1]}/index.html?project={name}')
                page.wait_for_function('window.ready===true',timeout=60000)
                page.locator('#sheet').screenshot(path=str(args.output/f'{name}-project-model.png'))
                print('Rendered',name)
            browser.close()
    finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
