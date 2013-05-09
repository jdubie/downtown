downtown
========

An updating markdown previewer in a browser

```
         .        .            |       .        .        .
              *        .       |   .        .
        .                     /-\     .           .   .
 .               .    .      |"""|              :        .
         .                  /"""""\  .      *       |>.
                           | # # # |     .        /\|  ___
    __     ___   ___   .   |# # # #| ___      ___/<>\ |:::|
  / ""|  __|~~| |'''|      |# # # #||"""|  __|"""|^^| |:::|
 /""""| |::|''|~~~~||_____ |# # # #||"""|-|::|"""|''|_|   |
 |""""| |::|''|""""|:::::| |# # # #||"""|t|::|"""|''|"""""|
 |""""|_|  |''|""""|:::::| |# # # #||"""|||::|"""|''""""""|
 |""""|::::|''|""""|:::::| |# # # #||"""|||::|"""|''""""""|

credit: www.retrojunkie.com/asciiart/building/skylines.htm
```

### getting started

install node package globally
```sh
$ npm install -g downtown 
```
cd into project root and start server
```sh
$ cd project
$ ls project
src/
README.md
$ downtown 
```
open browser to (http://localhost:6969/README.md)
```
$ echo "# Whoa it updates..." | cat - README.md > temp && mv temp README.md # updates
```
check back to browser and look for changes

### requirements
- browser must support HTML5 `EventStream`
- OS must support npm package `node-watch` which depends on the unstable `fs.watch`
