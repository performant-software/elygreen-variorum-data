const fs = require("fs");


async function loadFolioLookups() {
    const folioLookups = {};
    for( const doc of ['ElyGreenMS', 'eg-a', 'eg-b' ] ) {
        folioLookups[doc] = await generateFolioLookup(`https://faircopy.cloud/documents/${doc}/iiif/manifest.json`)
    }
    return folioLookups;
}

async function generateFolioLookup( manifestURL ) {
    const folioLookup = {};

    const response = await fetch(manifestURL)
    const manifest = await response.json();

    manifest.items.forEach(item => {
        // URI format "https://faircopy.cloud/documents/ElyGreenMS/iiif/canvas/f000",
        const canvasURI = item.id
        const uriParts = canvasURI.split('/')
        const folioID = uriParts[uriParts.length-1]
        // Page number format "0001"
        const pageNumber = parseInt(item.label.none[0])
        folioLookup[pageNumber] = folioID
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

function getCollationURL(manuscriptPageNumber, egAPageNumber, egBPageNumber, folioLookups) {
    const msFolioID = `ElyGreenMS_${folioLookups['ElyGreenMS'][manuscriptPageNumber]}`
    const egAFolioID = `egA_${folioLookups['eg-a'][egAPageNumber]}`
    const egBFolioID = `egB_${folioLookups['eg-b'][egBPageNumber]}`
    return `https://digitalelygreen.org/explore/#/ec/${msFolioID}/f/${egAFolioID}/f/${egBFolioID}/f`
}


async function run() {
    const folioLookups = await loadFolioLookups();
    const alignmentTable = loadAlignmentTable();

    // add header lines
    const alignmentTableLines = []
    alignmentTableLines.push("| ElyGreenMS | egA (1966 ed) | egB (1970 ed) | Collation |")
    alignmentTableLines.push("| --- | --- | --- | --- |")

    // add page lines
    for( let i=0; i < alignmentTable.length; i++ ) {
        const row = alignmentTable[i]
        const manuscriptPageNumber = parseInt(row[0])
        const egAPageNumber = parseInt(row[1])
        const egBPageNumber = parseInt(row[2])
        const collationURL = getCollationURL(manuscriptPageNumber,egAPageNumber,egBPageNumber,folioLookups)
        alignmentTableLines.push(`| ${manuscriptPageNumber} | ${egAPageNumber} | ${egBPageNumber} | [View](${collationURL}) |`)
    }

    const markdown = alignmentTableLines.join('\n')
    fs.writeFileSync("alignment-table/alignment.md", markdown);
}

run().then(() => console.log("done"));