package mx.com.axity.model;

import javax.persistence.*;

@Entity
@Table(name = "contacts", schema = "public")
public class ContactDO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "ds_name")
    private String name;
    @Column(name = "ds_lastname")
    private String lastName;
    @Column(name = "phone")
    private String phone;
    @Column(name="email")
    private String email;
    @Column(name="id_myaxity")
    private int id_myaxity;

    public ContactDO() {
    }

    public ContactDO(String name, String lastName, String phone, String email, int id_myaxity) {
        this.name = name;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.id_myaxity = id_myaxity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getId_myaxity() {
        return id_myaxity;
    }

    public void setId_myaxity(int id_myaxity) {
        this.id_myaxity = id_myaxity;
    }
}
