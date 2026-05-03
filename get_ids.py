import urllib.request
import re

def search(query):
    url = 'https://www.youtube.com/results?search_query=' + query.replace(' ', '+')
    html = urllib.request.urlopen(url).read().decode('utf-8')
    ids = re.findall(r'"videoId":"([^"]+)"', html)
    # remove duplicates and return first few
    return list(dict.fromkeys(ids))[:3]

print("Vote:", search("why voting matters india"))
print("Process:", search("how to vote in india step by step process"))
print("EVM:", search("election commission india evm vvpat explained"))
print("Democracy:", search("what is democracy explained"))
