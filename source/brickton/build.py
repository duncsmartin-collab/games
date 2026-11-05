import glob,sys
src='src/'
page=open(src+'page.html').read()
js=''.join(open(f).read()+'\n' for f in sorted(glob.glob(src+'[0-9]-*.js')))
three=sys.argv[1] if len(sys.argv)>1 else 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
out=page+f'\n<script src="{three}"></script>\n<script>\n(function(){{\n{js}\n}})();\n</script>\n'
open(sys.argv[2] if len(sys.argv)>2 else '/home/claude/brickton.html','w').write(out)
print(len(out))
