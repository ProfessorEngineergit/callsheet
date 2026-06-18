#!/usr/bin/env python3
"""Einmalige Migration der Live-Daten auf das neue Feier-Modell.
Nutzt den OAuth-Token der Firebase CLI (Owner) -> umgeht Security-Rules.
"""
import json, os, urllib.request

TOKEN = json.load(open(os.path.expanduser(
    '~/.config/configstore/firebase-tools.json')))['tokens']['access_token']
PROJECT = 'astroclub-planetenquiz'
BASE = f'projects/{PROJECT}/databases/(default)/documents'
URL = f'https://firestore.googleapis.com/v1/{BASE}:commit'

def s(v): return {'stringValue': v}
def arr(xs): return {'arrayValue': {'values': [s(x) for x in xs]}}

def person(pid, name, group, role, tags, color, initials, email=None, phone=None):
    f = {'name': s(name), 'group': s(group), 'role': s(role),
         'tags': arr(tags), 'color': s(color), 'initials': s(initials)}
    if email: f['email'] = s(email)
    if phone: f['phone'] = s(phone)
    return {'update': {'name': f'{BASE}/people/{pid}', 'fields': f}}

PEOPLE = [
    person('kay','Kay Schmid','technik','admin',['Leitung'],'#4A4A4A','KS','kschmid@waldorfschule-frankfurt.de'),
    person('bahrian','Bahrian Novotny','technik','admin',['Technik'],'#606060','BN','bahriannovotny@gmail.com'),
    person('lorenzo','Lorenzo Bay-Müller','technik','member',['Technik'],'#757575','LB'),
    person('thorsten','Thorsten Hochhaus','technik','member',['Technik'],'#8A8A8A','TH','th@freiraum-erleben.com','+49 163 7459361'),
    person('simon','Simon Bentlage','technik','member',['Technik'],'#9E9E9E','SB'),
    person('annika','Annika Hartel','technik','member',['Technik'],'#B3B3B3','AH'),
    person('sarah','Sarah Lindermayer','veranstalter','member',['Artistik'],'#525252','SL','info@sarah-lindermayer.de','0175 7163796'),
    person('emmy','Emmy Levedag','veranstalter','member',['Artistik'],'#383838','EL','emmy.levedag@icloud.com'),
    person('julia','Julia Janke','veranstalter','member',['Orga'],'#4A4A4A','JJ','juliajanke@googlemail.com'),
    person('ele','Ele','veranstalter','member',['Orga'],'#606060','EL','eljaele@googlemail.com'),
    person('jasper','Jasper Janke','veranstalter','member',['Orga','Artistik'],'#757575','JJ','jasper.janke@gmx.de'),
    person('soeren','Sören Pohl','veranstalter','member',['Zauberei'],'#8A8A8A','SP'),
    person('buehnentechnik','Bühnentechnik (Schule)','veranstalter','member',['Technik','Schule'],'#9E9E9E','BT','technik@waldorfschule-frankfurt.de'),
]

writes = []
# 1) Beispielaufgaben + Programm (acts) löschen
for i in range(1, 8):
    writes.append({'delete': f'{BASE}/tasks/task{i}'})
for i in range(1, 10):
    writes.append({'delete': f'{BASE}/acts/act{i}'})
# 2) Team setzen (Gruppen)
writes += PEOPLE
# 3) Zeitplan säubern: uncertain-Flag entfernen, fr3-Notiz/Titel
writes.append({'update': {'name': f'{BASE}/scheduleBlocks/mi1', 'fields': {}},
               'updateMask': {'fieldPaths': ['uncertain']}})
writes.append({'update': {'name': f'{BASE}/scheduleBlocks/fr3', 'fields': {
    'title': s('Proben + Licht-/Tonproben'),
    'note': s('Ablauf Freitagnachmittag: 13:00 Sketch · 13:30 Eurythmie · 14:00 Breigstreetboys · '
              '14:15 Showband · 15:00 Luftakrobatik (Emmy) · 15:30 Seil/Mast (Sarah) · '
              '16:00 Zauberei (Kay) · 16:30 Zauberei (Sören) · 17:00 Musik (Göbels/Sitter).')}},
    'updateMask': {'fieldPaths': ['title', 'note']}})

req = urllib.request.Request(
    URL, data=json.dumps({'writes': writes}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'},
    method='POST')
try:
    resp = urllib.request.urlopen(req)
    out = json.load(resp)
    print(f'OK – {len(out.get("writeResults", []))} Writes committed (von {len(writes)} gesendet).')
except urllib.error.HTTPError as e:
    print('FEHLER', e.code)
    print(e.read().decode())
