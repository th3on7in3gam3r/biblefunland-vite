import re

with open('src/components/GlobalSearch.jsx', 'r') as f:
    content = f.read()

start = content.index('const SEARCH_DATA = [')
end = content.index('\nconst AGE_OPTIONS')

before = content[:start]
after = content[end:]

new_data = open('scripts/search_data.js', 'r').read()

with open('src/components/GlobalSearch.jsx', 'w') as f:
    f.write(before + new_data + after)

print('Done')
