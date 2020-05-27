// Based on this
// https://codepen.io/arthurcamara1/pen/vgwWgX

// RegEx Variables for Syntax Highlighting
var strReg1 = /"(.*?)"/g,
    strReg2 = /'(.*?)'/g,
    numReg = /\b(\d+)/g,
    jsReg1 = /\b(new|if|else|do|while|switch|for|foreach|in|continue|break|return|typeof)(?=[^\w])/g,
    jsReg2 = /\b(document|window|Array|String|Object|Number|Function|function|var|const|let|\.length|\.\w+)(?=[^\w])/g,
    funcReg = /\b(function<\/span>)(\s+\w+)(\()(.*?)(?=[\)])(?=[^\w])/g,
    commentReg = /(\/\/.*)/g;

// Syntax Highlighting
function highlight(){
    $.each($('code p'),function(){
        var string = this.innerText, parsed = string.replace(/[ \t]/g, '&nbsp;');
        parsed = parsed.replace(strReg1,'<span class="string">"$1"</span>');
        parsed = parsed.replace(strReg2,"<span class=\"string\">'$1'</span>");
        parsed = parsed.replace(jsReg1,'<span class="js1">$1</span>');
        parsed = parsed.replace(jsReg2,'<span class="js2">$1</span>');
        parsed = parsed.replace(numReg,'<span class="js-num">$1</span>');
        parsed = parsed.replace(funcReg,'$1<span class="func-name">$2</span>$3<span class="func-args">$4</span>');
        parsed = parsed.replace(commentReg,'<span class="comment">$1</span>');
        parsed = parsed.split('\n').join('<br>');
        this.innerHTML = parsed;
    });
};

// Getting and setting caret position
// The cursor jumps to the beginning of the line when highlighting
// As a result, not having the caret functions === terrible UX
function getCaretPos(el) {
    var sel, caretOffset = 0,
        doc = el.ownerDocument || el.document,
        win = doc.defaultView || doc.parentWindow;
    
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        };
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(el);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    };
    return caretOffset;
};
function setCaretPos(el, pos){
    // Loop through all child nodes
    for(var node of el.childNodes){
        if(node.nodeType == 3){ // If text node
            if(node.length >= pos){
                var range = document.createRange(), sel = window.getSelection();
                range.setStart(node,pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return -1; // Done
            } else { pos -= node.length; };
        } else {
            pos = setCaretPos(node,pos);
            if(pos == -1){ return -1; }; // no need to finish the for loop
        };
    };
    return pos; // needed because of recursion stuff
};

// For tabs (normally tab switches the focus out of the window)
function insertTab() {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( document.createTextNode('  ') );
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = '  ';
    };
};

// --- DOC READY ---
$(document).ready(function(){ 
    var el = document.getElementById('code');
    highlight(); highlight();
    
    $('code').keyup(function(e){
        // Highlight syntax and set cursor
        if(e.keyCode >= 48 || e.keyCode === 32) { 
            var caretPos = getCaretPos(el);
            highlight();
            setCaretPos(el,caretPos);
        };
    });
    
    $('code').keydown(function(e){
        // For Tabbing
        if(e.which === 9) {
            var caretPos = getCaretPos(el) + 2;
            insertTab();
            highlight();
            setCaretPos(el,caretPos);
            e.preventDefault();
        };
    });
});