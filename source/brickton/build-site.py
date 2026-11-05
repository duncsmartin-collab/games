import glob
src='src/'
page=open(src+'page.html').read()
js=''.join(open(f).read()+'\n' for f in sorted(glob.glob(src+'[0-9]-*.js')))
head='''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#14213D">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}</style>
'''
sw='''<script>if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}</script>'''
a,b=page.split('<style>',1)
out=head+a+'</head>\n<body>\n<style>'+b+f'\n<script src="three.min.js"></script>\n<script>\n(function(){{\n{js}\n}})();\n</script>\n{sw}\n</body>\n</html>\n'
import os; os.makedirs('site',exist_ok=True); open('site/index.html','w').write(out)
print('site',len(out))
