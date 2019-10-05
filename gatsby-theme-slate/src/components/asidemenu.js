import React, { Component } from 'react';
import _ from 'lodash'

export default class AsideMenu extends Component {
  constructor(props) {
    super(props)

    this.scrollSpy = this.scrollSpy.bind(this);
    this.scrollSpyOffset = 300;

    this.state = {
      activeNavItem: false,
    };
  }

  componentDidMount() {
    this.scrollSpy();
    window.addEventListener('scroll', this.scrollSpy);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollSpy);
  }

  scrollSpy() {
    const selector = 'h1, h2';
    const headers = Array.from(document.querySelectorAll(selector));

    const headersOffset = headers.map((el, i) => {
      const slug = el.id;
      let nextEl;

      if ((headers.length - 1) !== i) {
        nextEl = headers[i + 1].getBoundingClientRect().top;
      } else {
        nextEl = headers[i].getBoundingClientRect().top + 9000;
      }

      const offset = (nextEl + document.body.scrollTop) - this.scrollSpyOffset;


      return { slug, offset };
    });


    const headersScrollTop = headersOffset.filter(el => el.offset > 0);

    this.setState({ activeNavItem: headersScrollTop[0] });
  }

  getLinks(ast) {
    const headers = ast.children.filter(el => el.type === 'element' && _.includes(['h1', 'h2'], el.tagName));

    const beautified = headers.map((header) => {
      const link = {};
      link.tagName = header.tagName;
      link.textNode = header.children[1] ? header.children[1].value : '';
      link.id = header.properties.id;
      return link;
    });

    let h2s, h1Element
    const merged = []
    beautified.forEach((heading, index) => {
      if (heading.tagName === "h1") {
        if (h2s !== undefined) {
          merged.push({
            ...h1Element,
            children: h2s
          })
        }
        h2s = []
        h1Element = heading
      } else if (heading.tagName === "h2") {
        h2s.push(heading)
      }
    })
    if (h2s !== undefined) {
      merged.push({
        ...h1Element,
        children: h2s
      })
    }
    return merged
  }

  isChild(parent, slug) {
    return (parent.children.findIndex((e) => e.id === slug) >= 0)
  }

  render() {
    const { ast } = this.props
    const { activeNavItem } = this.state
    const links = this.getLinks(ast)
    return (
      <React.Fragment>
        <ul className="toc-list-h1">
          {links.map((linkh1) =>
            <li key={linkh1.id}>
              <a href={`#${linkh1.id}`} className={`toc-h1 toc-link ${activeNavItem.slug === linkh1.id ? "active" : ""} ${this.isChild(linkh1, activeNavItem.slug) ? "active-parent" : ""}`}>{linkh1.textNode}</a>
              <ul className={`toc-list-h2 active ${this.isChild(linkh1, activeNavItem.slug) ? "active" : ""}`} style={{ display: this.isChild(linkh1, activeNavItem.slug) ? "block" : "none" }}>
                {linkh1.children.map((linkh2) => <a key={linkh2.id} href={`#${linkh2.id}`} className={`toc-h2 toc-link ${activeNavItem.slug === linkh2.id ? "active" : ""}`}>{linkh2.textNode}</a>)}
              </ul>
            </li>
          )}
        </ul>
      </React.Fragment>
    )
  }
}