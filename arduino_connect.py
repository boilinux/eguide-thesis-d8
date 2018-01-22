#!/usr/bin/env python

import time
import httplib, urllib
import sys
import serial
import json
import os

domain = "printme.local"
token = "ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6"
pulse = 0
pulse_time = time.time()
receieved = ""
voice = "-ven-us+m3 -s150"

headers = {
	"Content-type": "application/x-www-form-urlencoded",
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
}

# Send credit to localhost.
def send_credit (uid, amount):
	global token
	global domain
	global headers

	params = urllib.urlencode({
		"token" : token,
		"amount" : amount,
		"uid" : uid,
	})

	httpr = httplib.HTTPConnection(domain)
	httpr.request("POST", "/api/data/create_credit", params, headers)

	result = httpr.getresponse()

	print result.status, result.reason

	sys.exit()

def send_activity (uid, op):
	global token
	global domain
	global headers

	params = urllib.urlencode({
		"token" : token,
		"op" : op,
		"uid" : uid,
	})

	httpr = httplib.HTTPConnection(domain)
	httpr.request("POST", "/api/data/create_activity", params, headers)

	result = httpr.getresponse()

	print result.status, result.reason

	sys.exit()

#serial initialize
ser = serial.Serial('/dev/ttyUSB0', 57600, timeout=1)

print "Serial initialize, done."

os.system("sudo espeak " + voice + " \"Hi " + sys.argv[1] + ", please insert coin. You have 30 seconds to insert coin. After the beep.\"")

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
			os.system("sudo espeak " + voice + " \"Hi " + sys.argv[1] + ", you have successfully inserted, " + str(coin) + " pesos, Thank you.\"")

			if (int(coin) > 5):
				change = coin - 5
				os.system("sudo espeak " + voice + " \"you have " + str(change) + " pesos worth of change.\"")
				ser.write('{"token":"' + token + '","username":"' + sys.argv[1] + '","uid":"' + sys.argv[2] + '","action":"change","change":"' + str(change) + '"}')

			# send_credit(uid, coin)

		if (op == "no_activity"):
			os.system("sudo espeak " + voice + " \"Hi " + sys.argv[1] + ", you have not inserted a coin. Transaction cancelled.\"")
			# send_activity(uid, "no_activity")

		sys.exit()
