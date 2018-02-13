#!/usr/bin/env python

import time
import httplib, urllib
import sys
import serial
import json
import os

domain = "192.168.8.130"
token = "ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6"
receieved = ""
voice = "-ven-us+m3 -s150"

# Send credit to localhost.
def send_data (uid, username):
	global token
	global domain

	headers = {
		"Content-type": "application/json",
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
		'password': token,
		'username': username,
		'uid': uid,
	}

	params = urllib.urlencode({
	})

	httpr = httplib.HTTPConnection(domain)
	httpr.request("POST", "/eguide/api/savedata", params, headers)

	result = httpr.getresponse()

	print result.status, result.reason

	sys.exit()

def espeak_func (txt):
	os.system('sudo su - eguide -c \'' + txt + '\'')

#serial initialize
ser = serial.Serial('/dev/ttyUSB0', 57600, timeout=1)

print "Serial initialize, done."

espeaktxt = "espeak " + voice + " \"Hi " + sys.argv[1] + ", please insert coins or bill. You have 30 seconds to insert coin. After the beep.\""
espeak_func(espeaktxt)

ser.write('{"token":"' + token + '","username":"' + sys.argv[1] + '","uid":"' + sys.argv[2] + '","action":"insert"}')

while 1:
	receieved = ser.readline();

	if len(receieved) != 0:
		print receieved

		json_response = json.loads(receieved)

		uid = json_response["uid"]
		coin = json_response["coin"]
		op = json_response["op"]

        	# send credit if valid.
		if (op == "insert_coin"):
			if (int(coin) > 5):
				espeaktxt = "espeak " + voice + " \"Hi " + sys.argv[1] + ", you have successfully inserted, " + str(coin) + " pesos, Thank you.\""
				espeak_func(espeaktxt)

				change = coin - 5
				espeaktxt = "espeak " + voice + " \"you have " + str(change) + " pesos worth of change.\""
				espeak_func(espeaktxt)

				ser.write('{"token":"' + token + '","username":"' + sys.argv[1] + '","uid":"' + sys.argv[2] + '","action":"change","change":"' + str(change) + '"}')
			elif (int(coin) < 5):
				espeaktxt = "espeak " + voice + " \"Hi " + sys.argv[1] + ", you have not inserted enough money. Please wait for your " + str(coin) + " pesos worth of change.\""
				espeak_func(espeaktxt)

				ser.write('{"token":"' + token + '","username":"' + sys.argv[1] + '","uid":"' + sys.argv[2] + '","action":"change","change":"' + str(coin) + '"}')
			if ( int(coin) >= 5):
				send_data(uid, sys.argv[1])
		if (op == "no_activity"):
			espeaktxt = "espeak " + voice + " \"Hi " + sys.argv[1] + ", Transaction cancelled.\""
			espeak_func(espeaktxt)

		sys.exit()
