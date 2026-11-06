"""Build Fetch into ../../fetch/index.html (Game Box) and fetch-artifact.html (claude.ai preview).
Run from anywhere: python3 source/fetch/build.py"""
import os
d = os.path.dirname(os.path.abspath(__file__)) + '/'
out = os.path.normpath(d + '../../fetch/') + '/'
p = open(d + 'page.html').read()
js = lambda n: '<script>\n' + open(d + n).read() + '\n</script>'
body = (p.replace('<script>/*MUSIC*/</script>', js('music.js'))
         .replace('<script>/*WORDS*/</script>', '<script>const WORDS5="' + open(d + 'words5.txt').read().strip() + '";</script>')
         .replace('<script>/*GAME*/</script>', js('game.js'))
         .replace('<script>/*REWARDS*/</script>', js('rewards.js'))
         .replace('<script>/*CROSSWORD*/</script>', js('crossword.js'))
         .replace('<script>/*INIT*/</script>', js('init.js')))
open(d + 'fetch-artifact.html', 'w').write(body)
head = '''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1b1410">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
'''
sw = "<script>if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}</script>\n"
open(out + 'index.html', 'w').write(head + '</head>\n<body>\n' + body + '\n' + sw + '</body>\n</html>\n')
print('built', out + 'index.html')
