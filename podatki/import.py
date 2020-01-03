from elasticsearch import Elasticsearch
import csv

es = Elasticsearch()

files = ["dana_posojila", "odhodki_investicijski_transferi", "odhodki_investicijski", "odhodki_placilo_sredstev_eu", 
"odhodki_tekoci", "odhodki_transferi", "odplacilo_dolga", "prejeta_vracila_posojil", "presezek_primankljaj", 
"prihodki_davcni", "prihodki_kapitalski", "prihodki_nedavcni", "prihodki_prejeta_sredstva", "prihodki_prejete_donacije", 
"prihodki_transferni", "proracun_skupaj", "zadolzevanje"]

for ime in files:
    path = './'+ime+'.csv'
    with open(path, encoding='utf-8-sig') as f:
        index_name = ime
        doctype = ime
        reader = csv.reader(f, delimiter=";")
        headers = []
        index = 0
        es.indices.delete(index=index_name, ignore=[400, 404])
        es.indices.create(index=index_name, ignore=400)
        es.indices.put_mapping(
            index=index_name,
            doc_type=doctype,
            ignore=400,
            body={
                doctype: {
                    "properties": {
                            "stevilka" : {
                            "type" : "long"
                            },
                            "tip" : {
                            "type" : "keyword"
                            },
                            "1998" : {
                            "type" : "long"
                            },
                            "1999" : {
                            "type" : "long"
                            },
                            "2000": {
                            "type": "long"
                            },
                            "2001" : {
                            "type" : "long"
                            },
                            "2002" : {
                            "type" : "long"
                            },
                            "2003" : {
                            "type" : "long"
                            },
                            "2004" : {
                            "type" : "long"
                            },
                            "2005" : {
                            "type" : "long"
                            },
                            "2006" : {
                            "type" : "long"
                            },
                            "2007" : {
                            "type" : "long"
                            },
                            "2008" : {
                            "type" : "long"
                            },
                            "2009" : {
                            "type" : "long"
                            },
                            "2010" : {
                            "type" : "long"
                            },
                            "2011" : {
                            "type" : "long"
                            },
                            "2012" : {
                            "type" : "long"
                            },
                            "2013" : {
                            "type" : "long"
                            },
                            "2014" : {
                            "type" : "long"
                            },
                            "2015" : {
                            "type" : "long"
                            },
                            "2016" : {
                            "type" : "long"
                            },
                            "2017" : {
                            "type" : "long"
                            },
                            "2018" : {
                            "type" : "long"
                            },
                            "2019" : {
                            "type" : "long"
                            }
                        }
                }
            }
        )

        headers = ["stevilka", "tip", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"]
        for i, row in enumerate(reader):
            try:
                if row[5]:
                    obj = {}
                    obj["stevilka"] = int(row[0])
                    obj["tip"] = row[1]
                    obj["1998"] = int(row[2])
                    obj["1999"] = int(row[3])
                    obj["2000"] = int(row[4])
                    obj["2001"] = int(row[5])
                    obj["2002"] = int(row[6])
                    obj["2003"] = int(row[7])
                    obj["2004"] = int(row[8])
                    obj["2005"] = int(row[9])
                    obj["2006"] = int(row[10])
                    obj["2007"] = int(row[11])
                    obj["2008"] = int(row[12])
                    obj["2009"] = int(row[13])
                    obj["2010"] = int(row[14])
                    obj["2011"] = int(row[15])
                    obj["2012"] = int(row[16])
                    obj["2013"] = int(row[17])
                    obj["2014"] = int(row[18])
                    obj["2015"] = int(row[19])
                    obj["2016"] = int(row[20])
                    obj["2017"] = int(row[21])
                    obj["2018"] = int(row[22])
                    obj["2019"] = int(row[23])
                    # put document into elastic search
                    es.index(index=index_name, doc_type=doctype, body=obj, id=index)
                    index = index + 1

            except Exception as e:
                print('error: ' + str(e) + ' in ' + str(i))
    print("Imported " + ime + ".csv!")
    f.close()