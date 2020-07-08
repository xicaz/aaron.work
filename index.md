---
layout: frontpage
cover: cover.gif
title: aaron.work
date:   2013-12-09 12:00:00
---

<div class="grid">
{% for post in site.posts %}
<div class="{{ post.gridclass }} grid-item">
    <a href="{{ post.url }}">
        <div class="box">
            <span class="title">
                {{ post.title }}
            </span>
            <span class="content">
                {{ post.excerpt }}
            </span>
        </div>
    </a>
</div>
{% endfor %}
</div>