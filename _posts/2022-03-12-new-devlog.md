---
layout: default
title: What's the Big Idea
excerpt_separator: <!--more-->
---

What's the Big Idea?
====================

### Intro Flavour Text

Life aboard station can get a bit dull. That's why many people choose the hazards of asteroid mining over the monotony of hydroponics or waste reclamation. 
Some of these people have significant resources to buy and refit safe and reliable vessels to lessen the dangers inherent in vacuum mining operations.
Some people of lesser means pool their resources to buy use mining ships with proven track records.
You and your friends have managed to acquire a vessel at zero cost.
The shining beacon of the good ship no-name-registered was described by the harbormaster as "now get that rusty piss bucket the hell away from my station before my workers start glowing in the dark."
It may not be much and it may kill you all but it's yours and it's home.


### The BIG Idea

The idea that I have for the game is that it will be a dwarf-fortress 'em up. That is it will be a detailed simulated world which the player interacts with by issuing orders to a squad of unfortunate agents. The setting that I'm intending here, as you hopefully got a hint of from the first paragraph, is a dangerously janky asteroid mining ship. The player will have to mine fuel and resources and repair, build out and upgrade their ship. 

Space, of course and the asteroid belt doubly so, is a pretty hostile environment. Keeping people alive in a thin walled bubble of air in a place like that will be a challenge. Hopefully a fun one.

I currently have six major elements (or layers) to the simulation:
* Air - try to keep it on the inside of the ship.
* Heat - don't get cooked
* Electrical - try to keep the air scrubber powered on
* Radioactivity - if the heat doesn't cook you ... keep the reactor running
* Items - the stuff that can bridge the other layers to for example power the air scrubber.
* Conduits - a layer that allows connections between different areas, think air pipes, electrical wiring, cooling.

An example might be if the player wants to have an airlock that can pump down to vacuum. That will require:
1. An enclosed space made of wall items that tell the air layer that they're impenetrable. 
2. A couple of door items that sometimes tell the air layer that they're impenetrable.
3. An air pump item to suck the air out of the enclosed space.
4. A length of conduit to connect to the air pump
5. A vent item that's on the other end of the air pump conduit.
6. An electrical connection to power the pump.

### Current Status

I have the air layer working and air conduits with vents. It's early days. Here's a screenshot of a high pressure enclosure linked by a conduit to the rest of the outer enclosed area. You can see the high pressure square in the outer area and pressure increasing around it represented by the blueness of the squares.

![Air conduit screenshot](/assets/2022-03-12-air-conduit.png)
