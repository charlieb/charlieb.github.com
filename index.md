---
layout: default
---

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
	  {{ post.excerpt }}
	  <a href="{{ post.url }}">read more</a>
    </li>
  {% endfor %}
</ul>
