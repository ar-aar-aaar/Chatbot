package mx.com.axity.services.service;

import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;

import java.util.List;

public interface IbecaService {

   List<ContactDO> getContact(String name);
   ContactDO getContactNA(String name, String lastName);
}
