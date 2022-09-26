SHELL     := /bin/sh
AWK       := mawk
UNAME     := $(shell uname -s)

DATA_DIR  := data
DIST_DIR  := dist
SRC_DIR   := src

DOCS       = doc/intro.md
DOCS      += doc/synopsis.md
DOCS      += doc/overview.md
DOCS      += doc/language.md
DOCS      += doc/builtins.md

INPUT_FMT := markdown
HTML_FMT  := html
TEXT_FMT  := plain

INPUT_EXT  = +header_attributes+multiline_tables

HFLAGS     = --standalone
HFLAGS    += --template=pandoc/doc.pdc
HFLAGS    += --syntax-definition=pandoc/ebnf.xml
HFLAGS    += --syntax-definition=pandoc/riff.xml
HFLAGS    += --from $(INPUT_FMT)$(INPUT_EXT)
HFLAGS    += --to $(HTML_FMT)
HFLAGS    += --columns=80
HFLAGS    += --mathjax
HFLAGS    += --table-of-contents
HFLAGS    += --toc-depth=3
HFLAGS    += --metadata date=`date +"%Y/%m/%d"`

TFLAGS     = --from $(INPUT_FMT)
TFLAGS    += --to $(TEXT_FMT)
TFLAGS    += --template=$(DATA_DIR)/plain.pdc

SFLAGS     = --style=compressed
SFLAGS    += --no-source-map

SWFLAGS    = --watch

FN_GARB   := $(shell perl -CS -e 'print "\x{21A9}\x{FE0E}"')

.PHONY: all

all: clean build

# Print the contents of a given variable within this file
print-% :
	$(info $* = $($*) ($(flavor $*))) @true


.PHONY:  help usage
.SILENT: help usage

help: usage

usage:
	printf "\\033[1mUSAGE:\\033[0m\\n\
	  make              Clean /dist and build\\n\
	  make build        Build HTML and plain-text files\\n\
	  make clean        Remove all files in /dist\\n\
	  make deploy       Push Git-tracked changes to server\\n\
	  make sass-live    Compile Sass to CSS, watching Sass files for changes\\n\
	  make print-VAR    Print the contents and flavor of a given variable VAR\\n\
	"


.PHONY:  build clean deploy html plaintext sass sass-live
.SILENT: help html plaintext sass


build: sass html
	mkdir -p $(DIST_DIR)
	cp $(SRC_DIR)/playground.js $(DIST_DIR)
	cp -r $(SRC_DIR)/lib $(DIST_DIR)
	cp -r $(SRC_DIR)/assets $(DIST_DIR)

clean:
	rm -rf $(DIST_DIR)

deploy:
	git push server # Assume "server" is set up in SSH config

html: sass
	mkdir -p $(DIST_DIR)
	pandoc $(DOCS) -o $(DIST_DIR)/index.html $(HFLAGS)
	echo "Compile Markdown to HTML"
ifeq ($(UNAME), Darwin)
	find . -type f -iname "index.html" | xargs sed -i '' 's/$(FN_GARB)/[return]/g'
else ifeq ($(UNAME), Linux)
	find . -type f -iname "index.html" | xargs sed -i 's/$(FN_GARB)/[return]/g'
endif
	echo "Replace default Pandoc footnote character"

plaintext:
	mkdir -p $(DIST_DIR)
	pandoc $(DOCS) -o $(DIST_DIR)/index $(TFLAGS)

sass:
	mkdir -p $(DIST_DIR)
	sass $(SRC_DIR)/style.sass $(DIST_DIR)/style.css $(SFLAGS)
	echo "Compile CSS from Sass"

sass-live:
	mkdir -p $(DIST_DIR)
	sass $(SRC_DIR)/style.sass $(DIST_DIR)/style.css $(SFLAGS) $(SWFLAGS)
