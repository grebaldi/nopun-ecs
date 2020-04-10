###############################################################################
#                                VARIABLES                                    #
###############################################################################
SHELL=/bin/bash
export PATH := ./node_modules/.bin:./bin:$(PATH)
export TS_NODE_PROJECT := ./tsconfig.json

###############################################################################
#                               FRONTEND BUILD                                #
###############################################################################
install::
	@yarn

start::
	@webpack-dev-server --mode development --open

build::
	@webpack --mode production
