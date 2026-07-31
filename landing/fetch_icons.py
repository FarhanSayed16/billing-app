import urllib.request
import json
icons = ['nestjs', 'supabase', 'flutter', 'prisma', 'redis', 'render']
for icon in icons:
    url = f'https://cdn.simpleicons.org/{icon}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        svg = urllib.request.urlopen(req).read().decode('utf-8')
        svg = svg.replace('<svg ', '<svg width="24" height="24" fill="currentColor" ')
        print(f'<!-- {icon.title()} -->')
        print(svg)
    except Exception as e:
        print(f'Error fetching {icon}: {e}')
