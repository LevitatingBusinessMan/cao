# Change Audio Output
Change audio output (CAO) is a little script I made one evening to make it easier for me to switch to a different audio device with PulseAudio. CAO does this by routing all existing audio inputs to a new device/sink using pactl. CAO is written in native NodeJS and has no other dependencies.

## Installing
First make sure [NodeJS](https://nodejs.org/) is installed. Then run these 3 commands to install cao to `/usr/bin`
```SH
git clone https://github.com/LevitatingBusinessMan/cao
cd cao
sudo make install
```

#### OR

via NPM:
```SH
npm i cao_pulse -g
```
