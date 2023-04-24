cd ~bin
sudo touch killport
sudo chmod 777 killport
sudo chmod +x killport
echo 'echo -e -n "\033[0;32mPlease enter a port number: \033[0m" && read port_number && if [ "$port_number" -ge 1 ] && [ "$port_number" -le 65535 ]; then if netstat -tuln | grep -q ":$port_number[[:space:]]"; then pid=$(lsof -ti :$port_number) && if [ -n "$pid" ]; then kill -9 $pid && echo -e "\033[0;33mThe process running on port \033[0;34m$port_number\033[0m \033[0;33mhas been terminated. ✅\033[0m"; else echo -e "\033[0;31mCould not find the process ID for port $port_number ❌.\033[0m"; fi; else echo -e "\033[0;31mThe port $port_number is not running.❌\033[0m"; fi; else echo -e "\033[0;31mInvalid port number. Please enter a number between 1 and 65535.❌\033[0m"; fi' > killport
