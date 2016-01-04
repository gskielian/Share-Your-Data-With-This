#!/bin/bash


data=`cat data.txt`
curl -H "Content-Type: application/json" -X POST -d '{"value":"'$data'"}' http://localhost:3000/items

