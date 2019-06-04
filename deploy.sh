cd frontend &&
yarn run build &&
tar -zcvf build.tar build &&
scp build.tar hetzner:~/tt &&
ssh hetzner tar -xvf ~/tt/build.tar -C ~/tt/frontend/ &&
ssh hetzner rm ~/tt/build.tar &&
rm build.tar &&
rm -r build &&
ssh hetzner cd ~/tt && git pull origin master &&
echo 'deployed'
