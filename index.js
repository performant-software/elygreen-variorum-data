const fs = require("fs");

const docIDs = ['ElyGreenMS', 'eg-a', 'eg-b' ]
const docFolioIDs = { 'ElyGreenMS': 'ElyGreenMS', 'eg-a': 'egA', 'eg-b': 'egB'}

async function loadFolioLookups() {
    const folioLookups = {};
    for( const doc of docIDs ) {
        folioLookups[doc] = await generateFolioLookup(`https://faircopy.cloud/documents/${doc}/iiif/manifest.json`)
    }
    return folioLookups;
}

async function generateFolioLookup( manifestURL ) {
    const folioLookup = {};

    const response = await fetch(manifestURL)
    const manifest = await response.json();

    manifest.items.forEach(item => {
        pageNumber = item.label.none[0]
    });

    return folioLookup;
}

function loadAlignmentTable() {
    const alignmentTable = []

    const alignment = fs.readFileSync("alignment-table/alignment.csv", "utf8");

    const rows = alignment.split("\n");
    for( const row of rows ) {
        const columns = row.split(",");
        alignmentTable.push(columns)
    }

    return alignmentTable
}

function getCollationURL( pageNumber, folioLookups ) {
    // pad numbers to 4 digits
//    return `${folioLookup[pageNumber]}`;

/// egA_f002

    const folioID = `${docID}_${pageID}`

    return `https://digitalelygreen.org/explore/#/ec/${}/f/${}/f/${}/f`
}


async function run() {
    const folioLookups = await loadFolioLookups();
    const alignmentTable = loadAlignmentTable();

    // add header lines
    const alignmentTableLines = []
    alignmentTableLines.push("| ElyGreenMS | egA (1966 ed) | egB (1970 ed) | Collation |")
    alignmentTableLines.push("| --- | --- | --- | --- |")

    // add page lines
    for( const row in alignmentTable ) {
        const manuscriptPageNumber = row[0]
        const collationURL = getCollationURL(manuscriptPageNumber,folioLookups)
        alignmentTableLines.push(`| ${manuscriptPageNumber} | ${row[1]} | ${row[2]} | [View](${collationURL}) |`)
    }

    const markdown = alignmentTableLines.join('\n')
    fs.writeFileSync("alignment-table/alignment.md", markdown);
}

run().then(() => console.log("done"));