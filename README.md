# LobbyService Web Interface

A web interface for the [Lobby-Service](https://github.com/kartoffelquadrat/LobbyService) [REST API backend](https://github.com/kartoffelquadrat/LobbyService/blob/master/markdown/api.md).

## About

This repository contains the sources for an inofficial LobbyService WebUi.
It is referenced as sub-repository by the LobbyService master, but is not pulled unless the git users has access to this additional repository.

## Setup

 * Clone the Lobby-Service as usually.
 * ```cd``` into ```src/main/resources```
 * Add this repository as subrepo in a dedicated folder ```static```:  
```git submodule add https://github.com/kartoffelquadrat/LobbyServiceWebInterface.git static```
 * On next reboot the LobbyService will automatically power up the web interface, in addition to the default REST-API.

## Usage

The WebUI can be accessed at: [http://127.0.0.1:4242/](http://127.0.0.1:4242).

 * All access to the web-ui requires login.
   * Administrators are directly forwarded to an administration panel. That allows manipulation of user data.
   * Users are forwarded to a game lobby that allows creation and participation in game sessions.

## Contact / Pull Requests

Contact information for bug reports and pull requests:

 * Author: Maximilian Schiedermeier ![email](markdown/email.png)
 * Github: [Kartoffelquadrat](https://github.com/kartoffelquadrat)
 * Webpage: [McGill University, School of Computer Science](https://www.cs.mcgill.ca/~mschie3)
 * License: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

