CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS product (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	title text NOT NULL,
	description text,
	price integer
)

CREATE TABLE IF NOT EXISTS stock (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	product_id uuid,
	count integer,
	FOREIGN KEY ("product_id") REFERENCES "product" ("id")
)

INSERT INTO product ("title", "description", "price") VALUES
('Ibanez GRG170DX Black Night', 'Electric guitar with maple wizard-neck, inhouse Infinity R pickups and Fat-10 tremolo', 230),
('Gibson Flying V Antique Natural', 'Flying V electric guitar with mahogany body, rosewood fingerboard, Burstbucker humbucker, incl. Gibson Hardshell Case', 1400),
('ESP LTD TE-200 Snow White', 'The ESP LTD TE-200 Snow White is a first-class electric guitar for rock and metal in traditional T-style', 400),
('PRS SE Standard 24 Vintage Cherry', 'The PRS SE Standard 24 (Vintage Cherry) 2018 is an electric guitar with 2x PRS SE 85/15 Humbuckers presented in assorted finishes', 500),
('Gretsch G6128T Players Edition Jet FT Bigsby Roundup Orange', 'Singlecut electric guitar, mahogany body, High Sensitive FilterTron Pickups, Bigsby B7CP String-Thru-Bigsby, Gotoh Locking Tuners', 1890),
('Fender Tom Morello Soul Power Stratocaster', 'Tom Morello Signature Stratocaster guitar, Vintage Noiseless Single Coils, Seymour Duncan SHR-1b Hot Rails, Floyd Rose FRT-O2000 tremolo', 1200),
('Schecter PT Fastback Gold Top', 'T-Style electric guitar, mahogany body, maple neck, ebony fretboard, Diamond UltraTron pickups, Diamond Hardtail, Grover tuners', 590),
('J & D Electric guitar V-200 S Skeleton', 'The V-200 S Skeleton is your direct access to the world of heavy and evil sounds', 125)

INSERT INTO stock ("product_id", "count") VALUES
('441e906c-4b95-4bbf-bebf-13f195a3e1dd', 15),
('c422efbb-6644-4af1-90f2-7eb1ee34155a', 8),
('7bb0b759-37bc-4ce4-921e-56e7ef2afe19', 10),
('fd8313dc-0363-42cb-a4fe-006b0df1b1b3', 5),
('fb3076b5-eaaa-4774-8b5d-85b4b897acf1', 2),
('818c8be1-68c6-491e-b725-98c4f26dd098', 1),
('270246c5-0ecd-41b7-b10e-69d57333ed68', 10),
('64747052-92b6-402d-b0c2-dcfb676ea6be', 5)
