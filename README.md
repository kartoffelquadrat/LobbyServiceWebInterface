# LobbyService Web Interface

A web interface for the [Lobby-Service](https://github.com/kartoffelquadrat/LobbyService) [REST API backend](https://github.com/kartoffelquadrat/LobbyService/blob/master/markdown/api.md).

## About

This repository contains the sources for an inofficial LobbyService WebUi.
It is referenced as sub-repository by the LobbyService master, but is not pulled unless the git users has access to this additional repository.

## Installation

 * Clone the Lobby-Service as usually.
 * ```cd``` into ```src/main/resources```
 * Add this repository as subrepo:  
```git submodule add ...```


## Usage

The WebUI can be accessed at: [http://127.0.0.1:4242/](http://127.0.0.1:4242).

 * All access to the web-ui requires login.
   * Administrators are directly forwarded to an administration panel. That allows manipulation of user data.
   * Users are forwarded to a game lobby that allows creation and participation in game sessions.

