---
layout: default
title: Layers: Air and Heat
excerpt_separator: <!--more-->
---

Layers
======

### What?

This is a concept for both architecture and gameplay. The idea is very simple: that different subsystems live on different layers "under" the play surface. In this blog I'll write about two of the layers, what they're for, how they work from the player's perspective and how they're implemented. One interesting point is that for the player they're two(+) layers but in the code it's only one layer with two(+) systems running side-by-side.

### Gameplay - Air Layer

It's hard for agents to breathe if there isn't any air. Not being able to breathe, at least in the simulation that I'm planning, will prove harmful if not fatal. So maintaining a supply of correctly pressurized air going to be pretty important to keep the spacecraft habitable. Air flows everywhere except where it's blocked by hull plates or closed hatches. If you want to expand the ship first you have to enclose an area with hull and then let air flow into it. 

The very basic square test "ship" that you'll see in following screenshots is just a series of walls or hull plates. Right now "air" is just a single thing, so really it's pressure. Eventually I'll separate it into different gasses: at least CO2 and O2 and maybe some nasty toxics. Adding more gasses is not a hard thing to implement.
