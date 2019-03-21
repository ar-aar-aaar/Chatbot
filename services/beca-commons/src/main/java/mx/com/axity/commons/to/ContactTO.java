package mx.com.axity.commons.to;

import java.io.Serializable;

public class ContactTO implements Serializable {
    private int id;
    private String name;
    private String lastName;
    private String phone;
    private String email;
    private int id_myaxity;

    public int getId() {
        return id;
    }

    public void setId(int id) {
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
