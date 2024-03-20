import type MarkdownIt from 'markdown-it'

export interface PrettyLink {
    pattern: RegExp
    color?: string
    icon?: string
}

export const prettyLinkPlugin = (md: MarkdownIt, patterns:PrettyLink[]) =>  {
    var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx]
        var aIndex = token.attrIndex('href');
        if (aIndex >= 0) {
            const hrefAttr = token.attrs![aIndex];
            const url = hrefAttr[1];
            
            if (!url.startsWith('#')) {
                for (const pattern of patterns) {
                    if (pattern.pattern.test(url)) {
                        if(pattern.color && pattern.icon)
                            token.attrPush(['style', `color: ${pattern.color};line-height: 24px;`]);
                        else if(pattern.color){
                            token.attrPush(['style', `color: ${pattern.color};`]);
                        }
                        if(pattern.icon){
                            var iconHtml = `<img src="${pattern.icon}" style="line-height: 24px;display: inline-block;vertical-align: bottom;margin-bottom: 2px;margin-right: 2px;" width="20" alt="icon">`; 
                            return iconHtml + defaultRender(tokens, idx, options, env, self);
                        }
                }}
                
            }
            
        }
        
        
        return defaultRender(tokens, idx, options, env, self);
    };
};