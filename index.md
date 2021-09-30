---
layout: frontpage
cover: cover.gif
title: aaron.work
date:   2013-12-09 12:00:00
---

<div id="masonrygrid" class="grid">
{% for post in site.posts %}
{% if post.hidden != true %}
  {% if post.size == "big" %}
  <div class="{{ post.gridclass }} grid-item big-grid-item">
  {% elsif post.size == "medium" %}
  <div class="{{ post.gridclass }} grid-item med-grid-item">
  {% else %}
  <div class="{{ post.gridclass }} grid-item">
  {% endif %}
      <a href="{{ post.url }}">
          <div class="card">
            {% if post.cardImage %}
              <div class="card-image">
                  <figure class="image is-16by9">
                    <img class="cover-image" src="{{post.cardImage}}" alt="image loading...">
                  </figure>
              </div>
            {% endif %}
            <div class="card-content">
              <p class="title is-4"> {{post.title}} </p>
              {{post.excerpt}}
            </div>
          </div>
      </a>
  </div>
  {% endif %}
{% endfor %}
<div class="grid-sizer"></div>
</div>