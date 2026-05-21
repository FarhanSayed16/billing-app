import requests
from bs4 import BeautifulSoup

def decode_secret_message(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    rows = soup.find_all("tr")

    points = {}
    max_x = 0
    max_y = 0

    # Skip header row
    for row in rows[1:]:
        cols = row.find_all("td")

        if len(cols) != 3:
            continue

        x = int(cols[0].get_text(strip=True))
        char = cols[1].get_text(strip=True)
        y = int(cols[2].get_text(strip=True))

        points[(x, y)] = char

        max_x = max(max_x, x)
        max_y = max(max_y, y)

    grid = [[" " for _ in range(max_x + 1)] for _ in range(max_y + 1)]

    for (x, y), char in points.items():
        grid[y][x] = char

    for row in grid:
        print("".join(row))


decode_secret_message("https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub")