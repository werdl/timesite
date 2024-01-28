# timesite
> a simple time website, synced to an NTP HTTP proxy (worldtimeapi.org)
## how
every second, it calibrates the time difference between your computer and the server, and then every 10ms, if instantiates a new Date object, and adds the time difference to it
## why
so you can have an accurate time
## more
go to the website and click the `h` key