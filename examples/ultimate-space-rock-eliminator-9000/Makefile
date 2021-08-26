#
# @author Wilhelm Behncke <behncke@sitegeist.de>
#

###############################################################################
#                                VARIABLES                                    #
###############################################################################
SHELL=/bin/bash
export PATH := ./node_modules/.bin:./bin:$(PATH)
export TS_NODE_PROJECT := ./tsconfig.json

###############################################################################
#                               FRONTEND BUILD                                #
###############################################################################
start:
	@webpack serve --mode development --open

build:
	@webpack --mode production

depcheck:
	@depcheck $$(pwd) --ignore-bin-package --ignores="@types/*,ts-loader,file-loader"