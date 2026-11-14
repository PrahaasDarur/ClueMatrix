from sqlalchemy import inspect, text

from database.session import engine

inspector = inspect(engine)

if "extracted_entities" not in inspector.get_table_names():
    print("Entity table does not exist yet.")
else:
    columns = {
        column["name"]
        for column in inspector.get_columns("extracted_entities")
    }

    if "page_number" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE extracted_entities "
                    "ADD COLUMN page_number INTEGER"
                )
            )
        print("Added page_number column.")
    else:
        print("page_number column already exists.")

print("Schema check complete.")
