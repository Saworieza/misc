# Automatically fetches menus for today, grades predefined cafes and based on
# additional information (weather, cafe of choice yesterday) gives recommendations
# where to go for lunch.

from datetime import date, timedelta
import urllib.request
import re

HIMA_SALI_URL = 'http://www.himasali.com/p/lounaslista.html'
DYLAN_MILK_URL = 'http://dylan.fi/milk/'

#Weather service
#http://yle.fi/saa/suomi/helsinki/pasila/

def format_date(d):
    return '%d\\.%d\\.' % (d.day, d.month)

def get_hima_sali_menu(date):
    date_label = format_date(date)

    response = urllib.request.urlopen(HIMA_SALI_URL)
    html = response.read().decode(response.headers.get_content_charset())
    dates_menu = re.findall(r'%s<br />\n(.*?)\n<br />' % (date_label), html, re.MULTILINE | re.DOTALL)

    if (len(dates_menu) == 0):
        return 'No menu'
    else:
        return dates_menu[-1]

today = date.today()
print('Today %s\n' % today.strftime('%d.%m.%y'))

hima_sali_menu = get_hima_sali_menu(today)
print('Hima & Sali:\n\n%s' % hima_sali_menu)