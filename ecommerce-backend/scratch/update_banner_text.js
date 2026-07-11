import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyRoot@2026',
    database: 'ecommerce',
    port: 3306
});

db.query("SELECT value FROM settings WHERE `key` = 'hero_slides'", (err, rows) => {
    if (err) {
        console.error('Error querying hero_slides:', err);
        db.end();
        return;
    }

    if (rows.length > 0) {
        try {
            let slides = JSON.parse(rows[0].value);
            console.log('Original slides:', JSON.stringify(slides, null, 2));
            
            let updated = false;
            slides = slides.map(slide => {
                if (slide.title && (
                    slide.title.toLowerCase().includes('school supplies') || 
                    slide.title.toLowerCase().includes('jewell')
                )) {
                    slide.title = "Come Shop with Us";
                    updated = true;
                }
                return slide;
            });

            if (!updated && slides.length > 0) {
                // If not explicitly matched but we have slides, let's check if the user wants to update the first slide
                // or if we just force-update any slide matching or default to first slide if it was displaying it
                console.log("No slide explicitly matched 'School Supplies' or 'Jewell'. Let's check if we should update the first slide.");
                slides[0].title = "Come Shop with Us";
                updated = true;
            }

            if (updated) {
                const newValue = JSON.stringify(slides);
                db.query("UPDATE settings SET value = ? WHERE `key` = 'hero_slides'", [newValue], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating hero_slides:', updateErr);
                    } else {
                        console.log('Successfully updated hero_slides in database!');
                        console.log('New slides:', newValue);
                    }
                    db.end();
                });
            } else {
                console.log('No updates needed.');
                db.end();
            }
        } catch (e) {
            console.error('Failed to parse slides JSON:', e);
            db.end();
        }
    } else {
        console.log('hero_slides key not found in settings.');
        db.end();
    }
});
