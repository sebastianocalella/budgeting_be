class Utils {
     // Function to import a CSV file
     static importCsv = (filePath) => {
        const expenses = [];
      
        fs.createReadStream(filePath)
          .pipe(csv({ separator: ';' }))  // Set CSV separator to semicolon
          .on("data", (row) => {
            expenses.push(row);
          })
          .on("end", () => {
            // After reading all rows, insert them into the database
            expenses.forEach((expense) => {
                if (expense["Uscite"]!=null && expense["Uscite"] != '' && expense["Categoria"]!=null && expense["Categoria"] != '' && expense["Data"]!=null && expense["Data"] != '') {
                    
                    let amount = expense['Uscite'];
                        amount = amount.replace('€', '').trim();
                        amount = amount.replace(',', '.');
                        amount = parseFloat(amount);
                    const category = expense['Categoria'];
                    let date = expense['Data'];
    
                    // Step 1: Create a mapping for Italian month abbreviations
                    const italianMonths = {
                    gen: '01',
                    feb: '02',
                    mar: '03',
                    apr: '04',
                    mag: '05',
                    giu: '06',
                    lug: '07',
                    ago: '08',
                    set: '09',
                    ott: '10',
                    nov: '11',
                    dic: '12'
                    };
    
                    // Step 2: Extract the parts of the date
                    const [day, month, year] = date.split(' ');
    
                    // Step 3: Convert to MySQL-compatible format
                    date = `${year}-${italianMonths[month]}-${day.padStart(2, '0')}`;
    
                    const description = expense['Descrizione'];
                    
                    // If description is empty, set it to null
                    const descriptionValue = description && description.trim() !== "" ? description : null;
                    
                    db.query(
                        "INSERT INTO expenses (amount, date, category, description) VALUES (?, ?, ?, ?)",
                        [amount, date, category, descriptionValue],
                        (err, results) => {
                            if (err) {
                                console.error("Error inserting row", err);
                            } else {
                                console.log("Inserted row", results);
                            }
                        }
                    );
                }
                });
          });
      };
}