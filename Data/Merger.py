import csv
import json
import time
start_time = time.time()

jsonfile1 = open('world.json', 'r')
jsonfile2 = open('1950-2100Final.json', 'r')

result = open('result.json', 'w')

data1 = json.load(jsonfile1)
data2 = json.load(jsonfile2)
a = "asd"
for country in data1["objects"]["subunits"]["geometries"] :
	if (country["type"] != "Point"):
		for country2 in data2:
			if (country2["name"] == country["properties"]["name"]):
				country["properties"] = country2
			#	for i in country2:
			#		a.append(i)
			#	print(country2)
			#print( country2["name"] )

json.dump(data1, result)
print("--- %s seconds ---" % (time.time() - start_time))