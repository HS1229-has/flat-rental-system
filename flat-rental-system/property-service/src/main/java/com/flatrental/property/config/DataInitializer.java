package com.flatrental.property.config;

import com.flatrental.property.entity.Property;
import com.flatrental.property.entity.PropertyType;
import com.flatrental.property.repository.PropertyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PropertyRepository propertyRepository;

    public DataInitializer(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed properties if the repository is empty.
        // This prevents custom owner properties and their uploaded images from being wiped on service restart.
        if (propertyRepository.count() > 0) {
            System.out.println("Properties already exist in the database. Skipping default data seeding.");
            return;
        }

        Long ownerId = 1L; // Seeded owner user in auth-service gets ID 1

        // --- PUNE ---
        // 1. Luxury 2BHK in Koregaon Park, Pune
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Luxury 2BHK in Koregaon Park")
                .description("Experience high-end living in Pune's most premium locality. Features a spacious living room, modern kitchen, and an attached balcony with gorgeous green views.")
                .address("Lane 7, Near German Bakery, Koregaon Park")
                .city("Pune")
                .rentAmount(new BigDecimal("35000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Koregaon Park")
                .furnishing("Furnished")
                .area(1200)
                .securityDeposit(new BigDecimal("70000.00"))
                .imageUrls("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80," + // Exterior
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," + // Living Room
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," + // Master Bedroom
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," + // Second Bedroom
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," + // Kitchen
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," + // Bathroom
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")  // Balcony
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 2. Modern 1BHK in Baner, Pune
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Modern 1BHK in Baner")
                .description("Sleek, minimalist 1BHK apartment perfect for working professionals. Located close to the Baner-Balewadi IT corridor with excellent connectivity.")
                .address("Pan Card Club Road, Baner")
                .city("Pune")
                .rentAmount(new BigDecimal("18000.00"))
                .propertyType(PropertyType.ONE_BHK)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Baner")
                .furnishing("Semi-Furnished")
                .area(650)
                .securityDeposit(new BigDecimal("35000.00"))
                .imageUrls("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80," + // Exterior
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," + // Living Room
                           "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80," + // Master Bedroom
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," + // Second Bedroom
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," + // Kitchen
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," + // Bathroom
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")  // Balcony
                .amenities("WiFi,AC,Parking,Power Backup,Security,Balcony")
                .build());

        // --- NOIDA ---
        // 3. Premium 3BHK in Sector 62, Noida
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Premium 3BHK near Sector 62")
                .description("Exquisite high-rise apartment in a premium gated community. Features modular kitchen, wooden flooring in master bedroom, and state of the art clubhouse amenities.")
                .address("Block C, Sector 62")
                .city("Noida")
                .rentAmount(new BigDecimal("32000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Sector 62")
                .furnishing("Furnished")
                .area(1500)
                .securityDeposit(new BigDecimal("60000.00"))
                .imageUrls("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 4. Cozy 1BHK in Sector 137, Noida
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Furnished 1BHK in Sector 137")
                .description("Ready-to-move-in fully furnished 1BHK. Includes television, refrigerator, microwave, and high-speed internet. Located right next to Metro station.")
                .address("Paras Tierea, Sector 137")
                .city("Noida")
                .rentAmount(new BigDecimal("16500.00"))
                .propertyType(PropertyType.ONE_BHK)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Sector 137")
                .furnishing("Furnished")
                .area(700)
                .securityDeposit(new BigDecimal("33000.00"))
                .imageUrls("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Balcony,Washing Machine")
                .build());

        // --- DELHI ---
        // 5. Spacious 3BHK in Saket, Delhi
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Spacious 3BHK Builder Floor in Saket")
                .description("Massive, sun-lit builder floor apartment in South Delhi. Features huge living area, three attached bathrooms, separate servant room, and private terrace access.")
                .address("J-Block, Saket")
                .city("Delhi")
                .rentAmount(new BigDecimal("55000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Saket")
                .furnishing("Semi-Furnished")
                .area(1800)
                .securityDeposit(new BigDecimal("110000.00"))
                .imageUrls("https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("AC,Parking,Power Backup,Security,Balcony,Washing Machine,Garden")
                .build());

        // 6. Cozy Studio in Vasant Kunj, Delhi
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Elegant Studio in Vasant Kunj")
                .description("Charming, fully-contained studio apartment in a peaceful, secure colony. Comes with elegant interior designs, custom wardrobes, and direct park access.")
                .address("Sector B, Vasant Kunj")
                .city("Delhi")
                .rentAmount(new BigDecimal("22000.00"))
                .propertyType(PropertyType.STUDIO)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Vasant Kunj")
                .furnishing("Furnished")
                .area(550)
                .securityDeposit(new BigDecimal("44000.00"))
                .imageUrls("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Security,Washing Machine")
                .build());

        // --- GURGAON ---
        // 7. Ultra Luxury 2BHK in Golf Course Road, Gurgaon
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Luxury 2BHK on Golf Course Road")
                .description("Ultra luxury residential property on Golf Course Road. Features imported marble flooring, modular fittings, and double-height balconies.")
                .address("DLF Phase 5, Golf Course Road")
                .city("Gurgaon")
                .rentAmount(new BigDecimal("45000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Golf Course Road")
                .furnishing("Furnished")
                .area(1400)
                .securityDeposit(new BigDecimal("90000.00"))
                .imageUrls("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 8. Spacious 3BHK in Sector 57, Gurgaon
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Spacious 3BHK in Sector 57")
                .description("Family-oriented apartment in a highly peaceful neighborhood. Gated community with kids play areas and beautiful landscaped parks.")
                .address("Sushant Lok 3, Sector 57")
                .city("Gurgaon")
                .rentAmount(new BigDecimal("35000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Sector 57")
                .furnishing("Semi-Furnished")
                .area(1650)
                .securityDeposit(new BigDecimal("70000.00"))
                .imageUrls("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("AC,Parking,Power Backup,Security,Lift,Balcony,Washing Machine")
                .build());

        // --- MUMBAI ---
        // 9. Premium 2BHK in Andheri West, Mumbai
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Premium 2BHK in Andheri West")
                .description("Superb apartment situated in the vibrant neighborhood of Andheri West. High ceiling, French windows, modular kitchen, and excellent lifestyle amenities nearby.")
                .address("Link Road, Near Infinity Mall, Andheri West")
                .city("Mumbai")
                .rentAmount(new BigDecimal("60000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Andheri West")
                .furnishing("Furnished")
                .area(950)
                .securityDeposit(new BigDecimal("150000.00"))
                .imageUrls("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 10. Modern Studio in Bandra West, Mumbai
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Chic Studio Apartment in Bandra")
                .description("A cozy, high-end studio in Bandra West. Walking distance from Carter Road promenade. Features intelligent storage, automated lighting, and premium view.")
                .address("Carter Road, Bandra West")
                .city("Mumbai")
                .rentAmount(new BigDecimal("40000.00"))
                .propertyType(PropertyType.STUDIO)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Bandra West")
                .furnishing("Furnished")
                .area(450)
                .securityDeposit(new BigDecimal("100000.00"))
                .imageUrls("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Washing Machine")
                .build());

        // --- BANGALORE ---
        // 11. High-End 2BHK in Whitefield, Bangalore
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Luxury 2BHK in Whitefield IT Hub")
                .description("Bright and airy apartment located in the heart of Bangalore's IT hub. Amenities include a modular kitchen, large balcony, gated security, and proximity to major office parks.")
                .address("ECC Road, Whitefield")
                .city("Bangalore")
                .rentAmount(new BigDecimal("38000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Whitefield")
                .furnishing("Furnished")
                .area(1280)
                .securityDeposit(new BigDecimal("120000.00"))
                .imageUrls("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 12. Smart 1BHK in Koramangala, Bangalore
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Smart 1BHK in Koramangala")
                .description("Centrally located in Koramangala's popular startup area. Close to cafes, workspaces, and transit points. Modern interiors, high-speed fiber internet.")
                .address("5th Block, Koramangala")
                .city("Bangalore")
                .rentAmount(new BigDecimal("21000.00"))
                .propertyType(PropertyType.ONE_BHK)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Koramangala")
                .furnishing("Furnished")
                .area(600)
                .securityDeposit(new BigDecimal("60000.00"))
                .imageUrls("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Balcony,Washing Machine")
                .build());

        // --- HYDERABAD ---
        // 13. High-Rise 3BHK in Gachibowli, Hyderabad
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Luxury 3BHK High-Rise in Gachibowli")
                .description("Splendid 3BHK apartment in a sprawling township in Gachibowli. Offers world class landscaping, indoor sports rooms, supermarkets inside campus, and direct ORR access.")
                .address("Near DLF Cybercity, Gachibowli")
                .city("Hyderabad")
                .rentAmount(new BigDecimal("48000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Gachibowli")
                .furnishing("Semi-Furnished")
                .area(1750)
                .securityDeposit(new BigDecimal("96000.00"))
                .imageUrls("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 14. Premium 2BHK in Jubilee Hills, Hyderabad
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Stunning 2BHK in Jubilee Hills")
                .description("Sophisticated builder floor in Hyderabad's most prestigious zone. Quiet neighborhood, architectural marvel with premium false ceiling and customized light fixtures.")
                .address("Road No. 36, Jubilee Hills")
                .city("Hyderabad")
                .rentAmount(new BigDecimal("32000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Jubilee Hills")
                .furnishing("Furnished")
                .area(1150)
                .securityDeposit(new BigDecimal("64000.00"))
                .imageUrls("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Balcony")
                .build());

        // --- CHENNAI ---
        // 15. Spacious 2BHK in Adyar, Chennai
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Spacious 2BHK in Adyar")
                .description("Lovely sun-lit apartment located in Adyar's quiet green lanes. Features 2 large bedrooms, custom cupboards, a covered parking slot, and walking distance to the beach.")
                .address("Kasturibai Nagar, Adyar")
                .city("Chennai")
                .rentAmount(new BigDecimal("28000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Adyar")
                .furnishing("Furnished")
                .area(1100)
                .securityDeposit(new BigDecimal("75000.00"))
                .imageUrls("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Balcony")
                .build());

        // 16. Modern 1BHK in T. Nagar, Chennai
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Chic 1BHK in Shopping District T. Nagar")
                .description("Exquisite, modern 1BHK in the heart of T. Nagar. Perfect for urban explorers and retail lovers. High-end electrical fits, security, and full power backup.")
                .address("G.N. Chetty Road, T. Nagar")
                .city("Chennai")
                .rentAmount(new BigDecimal("18500.00"))
                .propertyType(PropertyType.ONE_BHK)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("T. Nagar")
                .furnishing("Semi-Furnished")
                .area(700)
                .securityDeposit(new BigDecimal("40000.00"))
                .imageUrls("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Washing Machine")
                .build());

        // --- KOLKATA ---
        // 17. Premium 3BHK in Salt Lake, Kolkata
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Premium 3BHK in Salt Lake Sector 3")
                .description("Elegant and huge 3BHK apartment in Salt Lake Sector 3. Overlooks water body. Includes a modular kitchen, large living area, and separate storage spaces.")
                .address("Sector 3, Salt Lake City")
                .city("Kolkata")
                .rentAmount(new BigDecimal("30000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Salt Lake")
                .furnishing("Furnished")
                .area(1500)
                .securityDeposit(new BigDecimal("60000.00"))
                .imageUrls("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        // 18. Cozy Studio in Ballygunge, Kolkata
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Cozy Studio in Posh Ballygunge")
                .description("Superbly decorated studio room in the upscale neighborhood of Ballygunge. Quiet building, beautiful heritage view balcony, fully setup modular washroom.")
                .address("Ballygunge Circular Road")
                .city("Kolkata")
                .rentAmount(new BigDecimal("16000.00"))
                .propertyType(PropertyType.STUDIO)
                .bedrooms(1)
                .bathrooms(1)
                .available(true)
                .locality("Ballygunge")
                .furnishing("Furnished")
                .area(500)
                .securityDeposit(new BigDecimal("35000.00"))
                .imageUrls("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Balcony")
                .build());

        // 19. Premium 2BHK in Pari Chowk, Greater Noida
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Premium 2BHK near Pari Chowk")
                .description("Modern apartment with excellent connectivity to Yamuna Expressway. Gated society with round-the-clock security, modular kitchen, and beautiful park view balconies.")
                .address("Sector Omega I, Near Pari Chowk")
                .city("Greater Noida")
                .state("Uttar Pradesh")
                .latitude(28.4684)
                .longitude(77.5130)
                .rentAmount(new BigDecimal("22000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .locality("Pari Chowk")
                .furnishing("Semi-Furnished")
                .area(1100)
                .securityDeposit(new BigDecimal("45000.00"))
                .imageUrls("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Balcony")
                .build());

        // 20. Luxury 3BHK in Sector Pi, Greater Noida
        propertyRepository.save(Property.builder()
                .ownerId(ownerId)
                .title("Luxury 3BHK in Sector Pi")
                .description("Spacious high-rise apartment with premium wooden flooring in master bedroom, walking distance to metro station, massive clubhouse, gym, and swimming pool.")
                .address("AWHO Sector Pi-3")
                .city("Greater Noida")
                .state("Uttar Pradesh")
                .latitude(28.4556)
                .longitude(77.5255)
                .rentAmount(new BigDecimal("30000.00"))
                .propertyType(PropertyType.THREE_BHK)
                .bedrooms(3)
                .bathrooms(3)
                .available(true)
                .locality("Sector Pi")
                .furnishing("Furnished")
                .area(1650)
                .securityDeposit(new BigDecimal("60000.00"))
                .imageUrls("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80," +
                           "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80")
                .amenities("WiFi,AC,Parking,Power Backup,Security,Lift,Gym,Swimming Pool,Balcony,Washing Machine")
                .build());

        System.out.println("Default properties successfully seeded.");
    }
}
