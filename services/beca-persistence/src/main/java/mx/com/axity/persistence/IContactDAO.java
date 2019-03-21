package mx.com.axity.persistence;

import mx.com.axity.model.ContactDO;
import org.springframework.data.repository.CrudRepository;

public interface IContactDAO extends CrudRepository <ContactDO, Long> {
    ContactDO findByName(String name);
}
