# The Shasta Programming Language

Shasta is a programming language that transpiles to JavaScript. Its syntax is largely inspired by both Lisp and Python, but its semantics are closer to those of JavaScript. The language is still in very early development, but I encourage you to try it out and let me know of any suggestions, issues, or bugs you find. I'm leaving some very basic documentation below, but I plan to organize it better once more features have been implemented.

## Get Started

You can install Shasta off of NPM:

```bash
npm install shasta-lang -g
```

You can run the compiler using the CLI:

```bash
shasta-lang < <filename.shasta> > output.js
```

Alternatively, you can try Shasta online...Once I get around to building a website for it. (Somewhat high on the priority list)

## Syntax

### Numbers:

```
1
2.5
30000
0.998
_1.2   ; Negative numbers are prefixed with an underscore
```

### Strings:

```
"Hello, World!"
```

### Booleans:

```
true
false
```

### Arrays:

```
[1, 2, 3]
["Hello", "world!"]
["a", 1, "b", 2]
[1, 2, 3, ]          ; trailing commas are supported
```

### Assignment

```
abc = 1
def = 2.0
ghi = "Hello, World!"
jkl = [1, 2, 3]
; a valid identifier matches the regex /[a-zA-Z*+!_%\-/<>]+/
a-b*c+d = "valid identifier"
; variables can be used later
[abc, def, ghi, jkl, 5] ; [1, 2.0, "Hello, World!", [1, 2, 3], 5]
```

### Comments

```
; this is a line comment, indicated by a semicolon followed by a space.
```

### Applying Functions

```
(add 1 2)     ; 3
(+ 1 2)       ; + is an alias for add--operators are functions too!
(* 5 (+ 2 3)) ; 25
(print "Hello, World!") ; prints "Hello, World!" to the console
```

### Defining Functions

```
{|name| (+ "Hello, " name)}
{|name time_of_day| (join ["Hello, ", name, "! Good ", time_of_day] "")}
{(+ "Hello, " $)} ; $ is the first argument
({(+ "Hello, " $)} "World") ; "Hello, World"
{|2| (+ $ $1)} ; the 2 is the arity of the function (how many arguments it takes)
my_func = {(+ "Hello, " $)} ; assigning the function to a variable
(my_func "John") ; "Hello, John"
```

**More features coming very soon!**
