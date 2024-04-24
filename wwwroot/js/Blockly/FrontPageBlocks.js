Blockly.Blocks['uia_thesis_front_page'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("UIA Thesis Front Page")
        this.appendDummyInput()
            .appendField("Thesis type")
            .appendField(new Blockly.FieldDropdown([
                ["Bachelor (English)", "forside_bachelor_eng.pdf"],
                ["Bachelor (Norwegian)", "forside_bachelor_nor.pdf"],
                ["Master (English)", "forside_master_eng.pdf"],
                ["Master (Norwegian)", "forside_master_nor.pdf"]
            ]), "FRONT_PAGE_TYPE");
        this.appendDummyInput()
            .appendField("Project Title")
            .appendField(new Blockly.FieldTextInput("This is the Title"), "PROJECT_TITLE");
        this.appendDummyInput()
            .appendField("Subtitle")
            .appendField(new Blockly.FieldTextInput("This thesis could have a subtitle that often could be somewhat longer than the title, and also stretch over several lines."), "SUBTITLE");
        this.appendDummyInput()
            .appendField("Authors")
            .appendField(new Blockly.FieldTextInput("THE AUTHORS FULL NAME IN CAPITAL LETTERS"), "AUTHORS");
        this.appendDummyInput()
            .appendField("Supervisor")
            .appendField(new Blockly.FieldTextInput("Supervisor’s full name"), "SUPERVISOR");
        this.appendDummyInput()
            .appendField("Year")
            .appendField(new Blockly.FieldTextInput("2024"), "YEAR");

        this.setColour(0);
        this.setTooltip("Configures the front page of the thesis.");
        this.setHelpUrl("");
        this.setOutput(true, "FrontPage");  // This block now outputs a statement type "FrontPage"
    }
};

Blockly.JavaScript['uia_thesis_front_page'] = function(block) {
    var frontPageType = block.getFieldValue('FRONT_PAGE_TYPE');
    var projectTitle = block.getFieldValue('PROJECT_TITLE');
    var subtitle = block.getFieldValue('SUBTITLE');
    var authors = block.getFieldValue('AUTHORS');
    var supervisor = block.getFieldValue('SUPERVISOR');
    var year = block.getFieldValue('YEAR');

    var code = `\\begin{titlepage}
    
\\parindent 0mm
\\setlength{\\oddsidemargin}{0mm}
\\setlength{\\evensidemargin}{0mm}
\\setlength{\\topmargin}{-20mm}
\\setlength{\\textwidth}{165mm}
\\setlength{\\textheight}{260mm} 
    
\\AddToShipoutPicture*{
    \\put(-4,0){
        \\parbox[b][\\paperheight]{\\paperwidth}{%
            \\vfill
            \\centering
            \\includegraphics[width=1.275\\textwidth]{/data/images/${frontPageType}}%
            \\vfill
        }
    }
    \\put(0,0){%
        \\transparent{0}\\textcolor{white}{\\rule{\\paperwidth}{\\paperheight}}
    }
}
\\newcommand{\\projectTitle}{${projectTitle}}
\\newcommand{\\projectSubTitle}{${subtitle}}
\\newcommand{\\authors}{${authors}}
\\newcommand{\\supervisor}{${supervisor}}
\\newcommand{\\projectYear}{${year}}
\\newcommand{\\facultyName}{Faculty of Engineering and Science}
\\newcommand{\\departmentName}{Department of Engineering and Sciences}

\\begin{tabular}{p{12cm}}
                                                \\\\[5cm]
    \\LARGE{\\textsc{\\textbf{\\projectTitle}}} \\\\[1.5cm]
    \\projectSubTitle                           \\\\[2.5cm]
    \\large{\\authors}                          \\\\[9cm]
    \\Large{SUPERVISOR:}                        \\\\
    \\supervisor
\\end{tabular}



\\vfill


\\textbf{University of Agder, \\projectYear} \\\\
\\small{\\facultyName \\\\
\\departmentName}
\\vspace{1cm}
\\end{titlepage}
`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['uia_standard_report_front_page'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("UiA standard report front page");

        this.appendDummyInput()
            .appendField("Logo Language")
            .appendField(new Blockly.FieldDropdown([
                ["English", "uia_logo_english.png"],
                ["Norwegian", "uia_logo_norsk.png"]
            ]), "LOGO_TYPE");

        this.appendDummyInput()
            .appendField("Title")
            .appendField(new Blockly.FieldTextInput("Report title"), "TITLE");

        this.appendDummyInput()
            .appendField("Author")
            .appendField(new Blockly.FieldTextInput("Author(s)"), "AUTHOR");

        this.appendDummyInput()
            .appendField("Course Code")
            .appendField(new Blockly.FieldTextInput("Course code"), "COURSE_CODE");

        this.appendDummyInput()
            .appendField("Course")
            .appendField(new Blockly.FieldTextInput("Course name"), "COURSE");

        this.appendDummyInput()
            .appendField("Date")
            .appendField(new Blockly.FieldTextInput("City, month year"), "DATE");

        this.setColour(0);
        this.setTooltip("Creates a customized front page for reports or assignments.");
        this.setHelpUrl("");
        this.setOutput(true, "FrontPage");  // This block outputs a statement type "FrontPage"
    }
};

Blockly.JavaScript['uia_standard_report_front_page'] = function(block) {
    var logoType = block.getFieldValue('LOGO_TYPE');
    var title = block.getFieldValue('TITLE');
    var author = block.getFieldValue('AUTHOR');
    var courseCode = block.getFieldValue('COURSE_CODE');
    var course = block.getFieldValue('COURSE');
    var date = block.getFieldValue('DATE');

    var code = `\\thispagestyle{empty}
\\begin{center}
\\vspace*{-1cm} % Reduced space above the image
\\includegraphics[width=1\\textwidth]{/data/images/${logoType}}\\\\[1cm] % Reduced space after the image
{\\LARGE ${title}}\\\\[0.4cm] % Reduced space after the title
\\bigskip
By\\\\
\\bigskip
{\\large ${author}}\\\\[1cm] % Reduced space after the author
${courseCode}\\\\
${course}\\\\[0.8cm]
Faculty of technologies and science\\\\
University of Agder\\\\[0.8cm]
{\\large ${date}}
\\end{center}
\\newpage
`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};



Blockly.Blocks['uia_ikt_report_front_page'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("UiA IKT report front page");

        this.appendDummyInput()
            .appendField("Logo Language")
            .appendField(new Blockly.FieldDropdown([
                ["English", "uia_logo_english.png"],
                ["Norwegian", "uia_logo_norsk.png"]
            ]), "LOGO_TYPE");

        this.appendDummyInput()
            .appendField("Course code")
            .appendField(new Blockly.FieldTextInput("Course Code - Name of Course"), "DOCUMENT_TITLE");

        this.appendDummyInput()
            .appendField("Title")
            .appendField(new Blockly.FieldTextInput("Project Title"), "SUBTITLE");

        this.appendDummyInput()
            .appendField("Author(s)")
            .appendField(new Blockly.FieldTextInput("Author Name(s)"), "AUTHORS");
        

        this.appendDummyInput()
            .appendField("Semester and year")
            .appendField(new Blockly.FieldTextInput("Spring/Autumn Year"), "YEAR");

        this.setColour(0);
        this.setTooltip("Creates a customized front page for reports.");
        this.setHelpUrl("");
        this.setOutput(true, "FrontPage");  // This block outputs a LaTeX front page segment
    }
};

Blockly.JavaScript['uia_ikt_report_front_page'] = function(block) {
    var logoType = block.getFieldValue('LOGO_TYPE');
    var courseCode = block.getFieldValue('DOCUMENT_TITLE');
    var title = block.getFieldValue('SUBTITLE');
    var authors = block.getFieldValue('AUTHORS');
    var year = block.getFieldValue('YEAR');

    var code = `\\begin{titlepage}
    \\vbox{ }

    \\vbox{ }

    \\begin{center}
        % Upper part of the page
        \\includegraphics[width=1\\textwidth]{/data/images/${logoType}}\\\\[4cm]
        \\textsc{\\Large ${courseCode}}\\\\[0.7cm]

        % Title
        \\noindent\\makebox[\\linewidth]{\\rule{.7\\paperwidth}{.6pt}}\\\\[0.7cm]
        { \\large \\bfseries ${title}}\\\\[0.25cm]
        \\noindent\\makebox[\\linewidth]{\\rule{.7\\paperwidth}{.6pt}}\\\\[0.7cm]
        \\large{${year}}\\\\[1.2cm]
        \\vfill
        % Author and Supervisor
        \\large
        ${authors}
        
        \\\\
        
        % Lower part of the page
        {\\large \\today}
    \\end{center}
\\end{titlepage}
`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

import {FieldImageButton} from "./ImageBlocks.js";

Blockly.Blocks['generic_report_front_page'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Generic Report Front Page");

        this.appendDummyInput()
            .appendField(new FieldImageButton("Select Image"), "SRC");

        this.appendDummyInput()
            .appendField("Width:")
            .appendField(new Blockly.FieldDropdown([
                ["Full width", "\\textwidth"],
                ["3/4 width", "0.75\\textwidth"],
                ["1/2 width", "0.5\\textwidth"],
                ["1/4 width", "0.25\\textwidth"]
            ]), "WIDTH");

        this.appendDummyInput()
            .appendField("Title")
            .appendField(new Blockly.FieldTextInput("Enter title"), "TITLE");

        this.appendDummyInput()
            .appendField("Subtitle")
            .appendField(new Blockly.FieldTextInput("Enter subtitle"), "SUBTITLE");

        this.appendDummyInput()
            .appendField("Author(s)")
            .appendField(new Blockly.FieldTextInput("Author Name(s)"), "AUTHORS");

        this.appendDummyInput()
            .appendField("University/Institution")
            .appendField(new Blockly.FieldTextInput("University of..."), "INSTITUTION");

        this.appendDummyInput()
            .appendField("Year/Date")
            .appendField(new Blockly.FieldTextInput("2024"), "YEAR");

        this.appendDummyInput()
            .appendField("Supervisor")
            .appendField(new Blockly.FieldTextInput("Supervisor Name"), "SUPERVISOR");

        this.setColour(0);
        this.setTooltip("Creates a customizable front page for reports.");
        this.setHelpUrl("");
        this.setOutput(true, "FrontPage");  // This block outputs a LaTeX front page segment
    }
};

Blockly.JavaScript['generic_report_front_page'] = function(block) {
    var imageUrl = block.getFieldValue('SRC');
    var width = block.getFieldValue('WIDTH');
    var title = block.getFieldValue('TITLE');
    var subtitle = block.getFieldValue('SUBTITLE');
    var authors = block.getFieldValue('AUTHORS');
    var institution = block.getFieldValue('INSTITUTION');
    var year = block.getFieldValue('YEAR');
    var supervisor = block.getFieldValue('SUPERVISOR');

    var code = `\\begin{titlepage}
\\centering
${imageUrl ? `\\includegraphics[width=${width}]{/data/images/${imageUrl}}\\\\[1cm]` : ''}
{\\Huge \\textbf{${title}}} \\\\[0.4cm]
{\\large ${subtitle}} \\\\[1cm]
\\textit{Author(s):} ${authors} \\\\[1cm]
\\textit{Institution:} ${institution} \\\\[1cm]
\\textit{Year/Date:} ${year} \\\\[1cm]
\\textit{Supervisor:} ${supervisor} \\\\[1cm]
\\vfill
\\end{titlepage}
\\newpage
`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
