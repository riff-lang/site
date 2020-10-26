STYLE     := main

SHELL     := /bin/sh
AWK       := mawk
UNAME     := $(shell uname -s)

DATA_DIR  := data
DIST_DIR  := dist
FONT_DIR  := fonts
SASS_DIR  := sass
SRC_DIR   := src

INPUT_FMT := markdown
HTML_FMT  := html
TEXT_FMT  := plain

HFLAGS     = --standalone
HFLAGS    += --template=$(DATA_DIR)/html.pdc
HFLAGS    += --from $(INPUT_FMT)
HFLAGS    += --to $(HTML_FMT)
HFLAGS    += --title-prefix="Riff"
HFLAGS    += --css=../style.css
HFLAGS    += --mathjax
HFLAGS    += --table-of-contents
HFLAGS    += --toc-depth=3

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


build: sass html plaintext

clean:
	rm -rf $(DIST_DIR)

deploy:
	git push server # Assume "server" is set up in SSH config

html: sass
	for i in $$(find $(SRC_DIR) -iname "*.md"); do \
	mkdir -p $(DIST_DIR)/$$(basename $$i ".md"); \
	pandoc $$i -o $(DIST_DIR)/$$(basename $$i ".md")/index.html $(HFLAGS); \
	done
	echo "Compile Markdown to HTML"
ifeq ($(UNAME), Darwin)
	find $(DIST_DIR) -type f -iname "index.html" | xargs sed -i '' 's/$(FN_GARB)/[return]/g'
else ifeq ($(UNAME), Linux)
	find $(DIST_DIR) -type f -iname "index.html" | xargs sed -i 's/$(FN_GARB)/[return]/g'
endif
	echo "Replace default Pandoc footnote character"
	mv $(DIST_DIR)/index/index.html $(DIST_DIR)/index.html
	rm -rf $(DIST_DIR)/index
	echo "Resolve index file"
	cp -R $(FONT_DIR) $(DIST_DIR)
	echo "Copy fonts to dist/"
	cp -R asset $(DIST_DIR)

plaintext:
	mkdir -p $(DIST_DIR)/t
	for i in $$(find $(SRC_DIR) -iname "*.md"); do \
	pandoc $$i -o $(DIST_DIR)/t/$$(basename $$i ".md") $(TFLAGS); \
	done
	echo "Compile Markdown to plain text"
	cp -r $(SRC_DIR)/t $(DIST_DIR)/
	echo "Overwrite targeted plaintext files"
ifeq ($(UNAME), Darwin)
	find $(DIST_DIR)/t -type f | xargs sed -i "" "s/esc\[/$$(printf '\033[')/g"
else ifeq ($(UNAME), Linux)
	find $(DIST_DIR)/t -type f | xargs sed -i "s/esc\[/$$(printf '\033[')/g"
endif
	echo "Insert escape sequences into plaintext files"
	for f in $(DIST_DIR)/t/*; do $(AWK) '/^\[[0-9]\]/{p=$$0}{if(p&&!$$0)next; else print}' $$f > $(DIST_DIR)/t/tmp && mv -f $(DIST_DIR)/t/tmp $$f; done
	echo "Remove blank lines between footnote entries"

sass:
	sass $(SASS_DIR)/$(STYLE).sass $(DIST_DIR)/style.css $(SFLAGS)
	echo "Compile SASS stylesheets"

sass-live:
	sass $(SASS_DIR)/$(STYLE).sass $(DIST_DIR)/style.css $(SFLAGS) $(SWFLAGS)
