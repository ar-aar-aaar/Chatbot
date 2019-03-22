package mx.com.axity.services.service.impl;

import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;
import mx.com.axity.model.UserDO;
import mx.com.axity.persistence.IContactDAO;
import mx.com.axity.persistence.UserDAO;
import mx.com.axity.services.service.IbecaService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.lang.reflect.Type;
import java.util.List;

@Service
public class becaServiceImpl implements IbecaService {

    static final Logger LOG = LogManager.getLogger(becaServiceImpl.class);

    @Autowired
    IContactDAO contactDAO;

    @Autowired
    ModelMapper modelMapper;


    @Override
    public List<ContactDO> getContact(String name) {
        name = name.toLowerCase();
        LOG.info("---->>>name: " + name);
        return this.contactDAO.findByNameContaining(name);

        //return this.contactDAO.findByNameLike(name);
    }

    @Override
    public List<ContactDO> getContactNA(String name, String lastName) {
        return this.contactDAO.findByNameAndLastName(name, lastName);
    }

    //@Override
    //public ContactDO getContactQ(String name) {
    //    return this.contactDAO.findByNameQ(name);
   // }


}


