
var restarting = false;
var startedat = new Date();

var href = window.location.href;

if (href.includes("zhihu.com/") && href.includes("/edit")) 
    setInterval(check, 300);

//$(document).ready(function () {
var ready = false;
var $latex = $("<div id='latex'>LaTex Container</div>");
var $textarea = $("<textarea id='ta' style='height: 248px;' />");
function reload_latex(ele, caption) {

    var newline = "\r\n";
    var backslash = "\\";

    $("img", ele).each(function () {
        var index = this.src.indexOf("?tex=") + 5;
        var str = decodeURIComponent(this.src.substring(index));
        str = str.replace("\\begin{align}", "\\begin{align}\\begin{split}");
        str = str.replace("\\end{align}", "\\end{split}\\end{align}");
        var m = /(?<=\\tag\{).*?(?=\})/.exec(str);
        if (m != null) {
            var tag = m[0];
            str = str.replace("\\tag{" + tag + "}", "").trim();
            if (str.startsWith("\\begin{align}"))
                str = str.replace("\\begin{align}", "\\begin{align}\\label{" + tag + "}");
            else
                str = "\\begin{align}\\label{" + tag + "}" + str + "\\end{align}";
            this.parentNode.outerHTML = str.trim();
        }
        else
            this.parentNode.outerHTML = "$" + str.trim() + "$";
    });
    $(".Editable-unstyled", ele).each(function () {
        var line = this.innerText.trim();
        if (line.startsWith("$") && line.endsWith("$")) {
            var handled = false;
            if (line.startsWith("$\\begin{align}"))
                handled = true;
            if (line.startsWith("$\\begin{cases}"))
                handled = true;

            if(handled == false)
                this.innerHTML = newline + backslash + "[" + line.substring(1, line.length - 1) + backslash + "]";
            else
                this.innerHTML = newline + line.substring(1, line.length - 1) + newline;
        }
    });

    $("h2", ele).each(function () {
        this.outerHTML = backslash + "paragraph{" + this.innerText.trim() + "}";
    });
    $("span", ele).each(function () {
        if ($(this).attr("style") == "font-weight: bold;") {
            var text = decodeURI(this.innerText).trim();
            var a = text.indexOf("(");
            var b = text.indexOf(")");
            if (a >= 0 && a < b)
                this.outerHTML = backslash + "textbf{" + text + "}" + backslash + "index{" + text.substring(a + 1, b) + "}";
            else
                this.outerHTML = backslash + "textbf{" + text + "}";
        }
    });

    $("ul", ele).each(function () {
        var lines = [];
        lines.push("<div>" + backslash + "begin{itemize}</div>");
        $("li", $(this)).each(function () {
            lines.push("<div>" + backslash + "item " + this.innerText + "</div>");
        });
        lines.push("<div>" + backslash + "end{itemize}</div>");
        this.outerHTML = lines.join("");
    });
    $("ol", ele).each(function () {
        var lines = [];
        lines.push("<div>" + backslash + "begin{enumerate}</div>");
        $("li", $(this)).each(function () {
            lines.push("<div>" + backslash + "item " + this.innerText + "</div>");
        });
        lines.push("<div>" + backslash + "end{enumerate}</div>");
        this.outerHTML = lines.join("");
    });

    $(".Editable-unstyled", ele).each(function () {
        var line = decodeURI(this.innerText).trim();
        this.outerHTML = "<div>" + line + "</div>";
    });

    var tab = "\t";
    var res = [];
    res.push(tab + backslash + "section{" + caption + "}");
    $(ele)[0].innerText.split("\n").forEach(function (line) {
        var text = line.replace("undefined", "").trim();
        if (text.startsWith(backslash + "[") && text.endsWith(backslash + "]")) {
            res.push(tab + tab + tab + text);
            res.push("");
        } else if (text.startsWith(backslash + "paragraph{")) {
            res.push("");
            res.push(tab + tab + text);
        } else if (text.startsWith(backslash + "itemize{") || text.startsWith(backslash + "enumerate{")) {
                res.push("");
                res.push(tab + tab + tab + text);
        } else if (text.startsWith(backslash + "item{")) {
                res.push("");
                res.push(tab + tab + tab + tab + text);
        } else
                res.push(tab + tab + tab + text);
    });
    $textarea.val(res.join(newline));
}
function check() {
    if (ready)
        return;

    if (href.includes("zhihu.com/") && href.includes("/edit")) {
        // https://zhuanlan.zhihu.com/p/47396214/edit

        var title = $("textarea.Input");
        var editor = $(".Input.Editable");
        var layout = $(".WriteIndexLayout");
        var headline = $(".WriteIndex-pageTitle");

        //var container = $(".Layout-main");
        var container = $(".PostEditor-wrapper");
        var edit_zone = $(".Input.Editable [data-contents='true']");

        if (title.length == 1
            && editor.length == 1
            && layout.length == 1
            && headline.length == 1
            && container.length == 1
            && edit_zone.length == 1) {

            var caption = title[0].value
            document.title = "* " + caption;
            headline[0].innerText = caption;

            title[0].style.backgroundColor = "#333366";
            title[0].style.color = "#ffffff";

            editor[0].style.backgroundColor = "#555588";
            editor[0].style.color = "#ffffff";

            layout[0].style.backgroundColor = "#111133";

            if (caption.length > 0 && caption != "写文章") {
                container.append($textarea);
                container.append($latex);
                $latex.css("color", "#ffffff");
                $latex.html("[Reload LaTex]");
                $latex.click(function () {
                    $("#latex").html(edit_zone[0].innerHTML);
                    reload_latex($("#latex"), caption);
                });
                ready = true;
            }
        }
    }
}
