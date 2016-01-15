#!/bin/bash


./random_data.sh &
watch ./server_script.sh &
node index.js
